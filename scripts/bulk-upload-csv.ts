import { PrismaClient, TopicType, ContentType } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

interface CSVRow {
  class_name: string;
  subject_name: string;
  subject_order: string;
  chapter_name: string;
  chapter_order: string;
  topic_name: string;
  topic_type: string;
  topic_description: string;
  content_type: string;
  content_url: string;
}

// Helper functions to convert types to database enums
function convertToTopicType(type: string): TopicType {
  switch (type.toUpperCase()) {
    case 'VIDEO': return TopicType.VIDEO;
    case 'INTERACTIVE': return TopicType.INTERACTIVE;
    case 'EXERCISE': return TopicType.EXERCISE;
    case 'AUDIO': return TopicType.AUDIO;
    default: return TopicType.INTERACTIVE;
  }
}

// Helper function to get subject colors
function getSubjectColor(subjectName: string): string {
  const name = subjectName.toLowerCase();
  if (name.includes('english')) return 'from-blue-500 to-blue-600';
  if (name.includes('evs') || name.includes('environment')) return 'from-green-500 to-green-600';
  if (name.includes('math') || name.includes('mathematics')) return 'from-purple-500 to-purple-600';
  if (name.includes('science')) return 'from-teal-500 to-teal-600';
  if (name.includes('social') || name.includes('history')) return 'from-orange-500 to-orange-600';
  if (name.includes('hindi')) return 'from-red-500 to-red-600';
  return 'from-gray-500 to-gray-600'; // Default color
}

// Helper function to get subject icons
function getSubjectIcon(subjectName: string): string {
  const name = subjectName.toLowerCase();
  if (name.includes('english')) return '📚';
  if (name.includes('evs') || name.includes('environment')) return '🌍';
  if (name.includes('math') || name.includes('mathematics')) return '🔢';
  if (name.includes('science')) return '🔬';
  if (name.includes('social') || name.includes('history')) return '🏛️';
  if (name.includes('hindi')) return '📖';
  return '📝'; // Default icon
}

function parseCSV(csvContent: string): CSVRow[] {
  const lines = csvContent.split('\n');
  const headers = lines[0].split(',').map(h => h.trim());
  const rows: CSVRow[] = [];
  
  let currentRow = '';
  let insideQuotes = false;
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue;
    
    currentRow += (currentRow ? '\n' : '') + line;
    
    // Count quotes to determine if we're inside a quoted field
    let quoteCount = 0;
    for (const char of line) {
      if (char === '"') quoteCount++;
    }
    
    // If odd number of quotes, we're either entering or leaving a quoted section
    if (quoteCount % 2 === 1) {
      insideQuotes = !insideQuotes;
    }
    
    // If we're not inside quotes, this row is complete
    if (!insideQuotes) {
      const values: string[] = [];
      let currentValue = '';
      let quotedField = false;
      
      for (let j = 0; j < currentRow.length; j++) {
        const char = currentRow[j];
        
        if (char === '"') {
          if (quotedField && currentRow[j + 1] === '"') {
            // Handle escaped quotes
            currentValue += '"';
            j++; // Skip next quote
          } else {
            quotedField = !quotedField;
          }
        } else if (char === ',' && !quotedField) {
          values.push(currentValue.trim());
          currentValue = '';
        } else {
          currentValue += char;
        }
      }
      
      // Add the last value
      values.push(currentValue.trim());
      
      if (values.length === headers.length) {
        const row = {} as CSVRow;
        headers.forEach((header, index) => {
          (row as any)[header] = values[index];
        });
        rows.push(row);
      }
      
      currentRow = ''; // Reset for next row
    }
  }
  
  return rows;
}

async function bulkUploadFromCSV() {
  console.log('🌱 Starting bulk upload from CSV (preserving existing data)...\n');

  try {
    // Read the CSV file
    const csvPath = path.join(process.cwd(), 'scripts', 'bulk-uploader.csv');
    const csvContent = fs.readFileSync(csvPath, 'utf8');
    const rows = parseCSV(csvContent);

    console.log(`📋 Processing ${rows.length} topics from CSV...\n`);

    // Group data by class, subject, chapter for processing
    const classMap = new Map<string, {
      name: string;
      subjects: Map<string, {
        name: string;
        order: number;
        chapters: Map<string, {
          name: string;
          order: number;
          topics: Array<{
            name: string;
            type: string;
            description: string;
            contentType: string;
            contentUrl: string;
            order: number;
          }>;
        }>;
      }>;
    }>();

    // Parse and group the CSV data
    let topicCounter = 1;
    for (const row of rows) {
      const className = row.class_name;
      const subjectName = row.subject_name;
      const chapterName = row.chapter_name;
      
      if (!classMap.has(className)) {
        classMap.set(className, {
          name: className,
          subjects: new Map()
        });
      }
      
      const classData = classMap.get(className)!;
      
      if (!classData.subjects.has(subjectName)) {
        classData.subjects.set(subjectName, {
          name: subjectName,
          order: parseInt(row.subject_order),
          chapters: new Map()
        });
      }
      
      const subjectData = classData.subjects.get(subjectName)!;
      
      if (!subjectData.chapters.has(chapterName)) {
        subjectData.chapters.set(chapterName, {
          name: chapterName,
          order: parseInt(row.chapter_order),
          topics: []
        });
      }
      
      const chapterData = subjectData.chapters.get(chapterName)!;
      chapterData.topics.push({
        name: row.topic_name,
        type: row.topic_type,
        description: row.topic_description,
        contentType: row.content_type,
        contentUrl: row.content_url,
        order: topicCounter++
      });
      
      // Debug log to check content_url
      if (topicCounter <= 5) {
        console.log(`Debug - Topic: ${row.topic_name}`);
        console.log(`Debug - Content URL: ${row.content_url?.substring(0, 100)}...`);
      }
    }

    // Process each class
    for (const [className, classData] of classMap) {
      console.log(`📚 Creating/updating class: ${className}...`);

      // Check if class exists, then update or create
      const existingClass = await prisma.class.findFirst({
        where: { 
          OR: [
            { name: className },
            { name: className.replace('CBSE : ', '') }, // Handle CBSE prefix
            { name: `CBSE : ${className}` } // Handle missing CBSE prefix
          ]
        }
      });

      let createdClass;
      if (existingClass) {
        createdClass = await prisma.class.update({
          where: { id: existingClass.id },
          data: {
            name: existingClass.name, // Keep existing name
            description: `Educational content for ${existingClass.name}`,
            price: 29900, // Default price
            currency: 'INR',
            isActive: true
          }
        });
        console.log(`  ✅ Updated existing class: ${existingClass.name}`);
      } else {
        // Clean the class name for new classes
        const cleanClassName = className.replace('CBSE : ', '');
        createdClass = await prisma.class.create({
          data: {
            name: cleanClassName,
            description: `Educational content for ${cleanClassName}`,
            price: 29900, // Default price
            currency: 'INR',
            isActive: true
          }
        });
        console.log(`  ✅ Created new class: ${cleanClassName}`);
      }

        // Process subjects
        for (const [subjectName, subjectData] of classData.subjects) {
          // Clean subject name (remove "Class X : " prefix)
          const cleanSubjectName = subjectName.replace(/^Class \d+ : /, '');
          console.log(`    📖 Creating/updating subject: ${cleanSubjectName}`);

          const existingSubject = await prisma.subject.findFirst({
            where: {
              name: cleanSubjectName,
              classId: createdClass.id
            }
          });

          let createdSubject;
          if (existingSubject) {
            createdSubject = await prisma.subject.update({
              where: { id: existingSubject.id },
              data: {
                icon: getSubjectIcon(cleanSubjectName),
                color: getSubjectColor(cleanSubjectName),
                price: 7500, // Default subject price
                currency: 'INR',
                orderIndex: subjectData.order,
                isLocked: false
              }
            });
            console.log(`      ✅ Updated existing subject: ${cleanSubjectName} (${getSubjectColor(cleanSubjectName)})`);
          } else {
            createdSubject = await prisma.subject.create({
              data: {
                name: cleanSubjectName,
                icon: getSubjectIcon(cleanSubjectName),
                color: getSubjectColor(cleanSubjectName),
                price: 7500, // Default subject price
                currency: 'INR',
                orderIndex: subjectData.order,
                classId: createdClass.id,
                isLocked: false
              }
            });
            console.log(`      ✅ Created new subject: ${cleanSubjectName} (${getSubjectColor(cleanSubjectName)})`);
          }        // Process chapters
        for (const [chapterName, chapterData] of subjectData.chapters) {
          console.log(`      📝 Creating/updating chapter: ${chapterName}`);

          const existingChapter = await prisma.chapter.findFirst({
            where: {
              name: chapterName,
              subjectId: createdSubject.id
            }
          });

          let createdChapter;
          if (existingChapter) {
            createdChapter = await prisma.chapter.update({
              where: { id: existingChapter.id },
              data: {
                orderIndex: chapterData.order
              }
            });
            console.log(`        ✅ Updated existing chapter: ${chapterName}`);
          } else {
            createdChapter = await prisma.chapter.create({
              data: {
                name: chapterName,
                orderIndex: chapterData.order,
                subjectId: createdSubject.id
              }
            });
            console.log(`        ✅ Created new chapter: ${chapterName}`);
          }

          // Process topics
          for (const topicData of chapterData.topics) {
            console.log(`        🎯 Creating/updating topic: ${topicData.name}`);

            const existingTopic = await prisma.topic.findFirst({
              where: {
                name: topicData.name,
                chapterId: createdChapter.id
              }
            });

            if (existingTopic) {
              // Update existing topic
              await prisma.topic.update({
                where: { id: existingTopic.id },
                data: {
                  type: convertToTopicType(topicData.type),
                  duration: '10-15 mins', // Default duration
                  orderIndex: topicData.order,
                  description: topicData.description
                }
              });

              // Update topic content - always store iframe HTML in textContent
              await prisma.topicContent.upsert({
                where: { topicId: existingTopic.id },
                update: {
                  contentType: ContentType.IFRAME,
                  textContent: topicData.contentUrl, // Store the complete iframe HTML here
                  url: null,
                  videoUrl: null,
                  pdfUrl: null,
                  widgetConfig: undefined
                },
                create: {
                  topicId: existingTopic.id,
                  contentType: ContentType.IFRAME,
                  textContent: topicData.contentUrl, // Store the complete iframe HTML here
                  url: null,
                  videoUrl: null,
                  pdfUrl: null,
                  widgetConfig: undefined
                }
              });
              
              console.log(`          ✅ Updated existing topic: ${topicData.name} with iframe content`);
            } else {
              // Create new topic with content
              await prisma.topic.create({
                data: {
                  name: topicData.name,
                  type: convertToTopicType(topicData.type),
                  duration: '10-15 mins', // Default duration
                  orderIndex: topicData.order,
                  description: topicData.description,
                  chapterId: createdChapter.id,
                  content: {
                    create: {
                      contentType: ContentType.IFRAME,
                      textContent: topicData.contentUrl, // Store the complete iframe HTML here
                      url: null,
                      videoUrl: null,
                      pdfUrl: null,
                      widgetConfig: undefined
                    }
                  }
                }
              });
              console.log(`          ✅ Created new topic: ${topicData.name} with iframe content`);
            }
          }
        }
      }

      console.log(`✅ ${className} processed with ${classData.subjects.size} subjects\n`);
    }

    console.log('\n🎉 Bulk upload completed successfully!');

    // Summary
    const classCount = await prisma.class.count();
    const subjectCount = await prisma.subject.count();
    const chapterCount = await prisma.chapter.count();
    const topicCount = await prisma.topic.count();
    const contentCount = await prisma.topicContent.count();

    console.log('\n📊 Final Summary:');
    console.log(`• Total Classes: ${classCount}`);
    console.log(`• Total Subjects: ${subjectCount}`);
    console.log(`• Total Chapters: ${chapterCount}`);
    console.log(`• Total Topics: ${topicCount}`);
    console.log(`• Total Content Items: ${contentCount}`);
    console.log('\n🚀 Database is now populated with IFRAME-based educational content from CSV!');

  } catch (error) {
    console.error('❌ Error during bulk upload:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Stack trace:', error.stack);
    }
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the bulk upload
if (require.main === module) {
  bulkUploadFromCSV()
    .catch((e) => {
      console.error('❌ Bulk upload failed:', e);
      process.exit(1);
    });
}

export default bulkUploadFromCSV;