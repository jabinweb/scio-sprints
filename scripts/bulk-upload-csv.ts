import { PrismaClient, TopicType, ContentType } from '@prisma/client';
import fs from 'fs';
import csv from 'csv-parser';
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

interface ProcessedData {
  classes: Map<string, {
    subjects: Map<string, {
      order: number;
      chapters: Map<string, {
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
  }>;
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

function convertToContentType(type: string): ContentType {
  switch (type.toUpperCase()) {
    case 'VIDEO': return ContentType.VIDEO;
    case 'IFRAME': return ContentType.IFRAME;
    case 'HTML': return ContentType.IFRAME; // Map HTML to IFRAME
    case 'AUDIO': return ContentType.EXTERNAL_LINK; // Map AUDIO to EXTERNAL_LINK
    case 'PDF': return ContentType.PDF;
    case 'TEXT': return ContentType.TEXT;
    case 'INTERACTIVE_WIDGET': return ContentType.INTERACTIVE_WIDGET;
    case 'EXTERNAL_LINK': return ContentType.EXTERNAL_LINK;
    default: return ContentType.IFRAME;
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
  if (name.includes('hindi')) return '🇮🇳';
  return '📖'; // Default icon
}

// Subject price mapping based on our previous price structure
const getSubjectPrice = (className: string, subjectName: string): number => {
  // Prices in paisa (₹1 = 100 paisa)
  if (subjectName.toLowerCase().includes('english')) {
    if (className === 'Class 4' || className === 'Class 5') {
      return 24900; // ₹249
    } else {
      return 29900; // ₹299
    }
  }
  return 29900; // ₹299 for all other subjects
};

// Function to parse CSV and organize data
async function parseCSV(): Promise<ProcessedData> {
  return new Promise((resolve, reject) => {
    const csvPath = path.join(__dirname, 'bulk-uploader.csv');
    const data: ProcessedData = {
      classes: new Map()
    };

    console.log('📁 Reading CSV file from:', csvPath);

    fs.createReadStream(csvPath)
      .pipe(csv())
      .on('data', (row: CSVRow) => {
        const className = row.class_name.trim();
        const subjectName = row.subject_name.trim();
        const chapterName = row.chapter_name.trim();

        // Initialize class if it doesn't exist
        if (!data.classes.has(className)) {
          data.classes.set(className, { subjects: new Map() });
        }

        const classData = data.classes.get(className)!;

        // Initialize subject if it doesn't exist
        if (!classData.subjects.has(subjectName)) {
          classData.subjects.set(subjectName, {
            order: parseInt(row.subject_order) || 1,
            chapters: new Map()
          });
        }

        const subjectData = classData.subjects.get(subjectName)!;

        // Initialize chapter if it doesn't exist
        if (!subjectData.chapters.has(chapterName)) {
          subjectData.chapters.set(chapterName, {
            order: parseInt(row.chapter_order) || 1,
            topics: []
          });
        }

        const chapterData = subjectData.chapters.get(chapterName)!;

        // Add topic to chapter
        chapterData.topics.push({
          name: row.topic_name.trim(),
          type: row.topic_type.trim(),
          description: row.topic_description.trim(),
          contentType: row.content_type.trim(),
          contentUrl: row.content_url.trim(),
          order: chapterData.topics.length + 1
        });
      })
      .on('end', () => {
        console.log('✅ CSV parsing completed successfully');
        resolve(data);
      })
      .on('error', (error) => {
        console.error('❌ Error parsing CSV:', error);
        reject(error);
      });
  });
}

// Function to clear existing data
async function clearExistingData() {
  console.log('🗑️ Clearing existing data...');
  
  try {
    // Delete in correct order to avoid foreign key constraints
    await prisma.topicContent.deleteMany();
    console.log('   ✅ Cleared topic content');
    
    await prisma.topic.deleteMany();
    console.log('   ✅ Cleared topics');
    
    await prisma.chapter.deleteMany();
    console.log('   ✅ Cleared chapters');
    
    await prisma.subject.deleteMany();
    console.log('   ✅ Cleared subjects');
    
    // Keep classes but could clear them too if needed
    // await prisma.class.deleteMany();
    // console.log('   ✅ Cleared classes');
    
    console.log('🎯 Database cleared successfully');
  } catch (error) {
    console.error('❌ Error clearing database:', error);
    throw error;
  }
}

// Main bulk upload function
async function bulkUploadFromCSV() {
  console.log('🚀 Starting bulk upload from CSV...\n');

  try {
    // Step 1: Parse CSV data
    const processedData = await parseCSV();

    // Step 2: Clear existing data
    await clearExistingData();

    // Step 3: Create/update classes and insert new data
    console.log('\n📊 Creating database entries...\n');

    for (const [className, classData] of processedData.classes) {
      console.log(`🏫 Processing ${className}...`);

      // Find or create class
      let dbClass = await prisma.class.findFirst({
        where: { name: className }
      });

      if (!dbClass) {
        // Determine class price based on our price structure
        let classPrice = 69900; // Default ₹699 for Class 4-5
        if (['Class 6', 'Class 7', 'Class 8'].includes(className)) {
          classPrice = 89900; // ₹899 for Class 6-8
        }

        dbClass = await prisma.class.create({
          data: {
            name: className,
            description: `Educational content for ${className}`,
            price: classPrice,
            currency: 'INR',
            isActive: true
          }
        });
        console.log(`   ✅ Created class: ${className} (₹${classPrice / 100})`);
      } else {
        console.log(`   ℹ️ Using existing class: ${className}`);
      }

      // Process subjects
      for (const [subjectName, subjectData] of classData.subjects) {
        const subjectPrice = getSubjectPrice(className, subjectName);
        const subjectColor = getSubjectColor(subjectName);
        const subjectIcon = getSubjectIcon(subjectName);

        const dbSubject = await prisma.subject.create({
          data: {
            name: subjectName,
            classId: dbClass.id,
            orderIndex: subjectData.order,
            icon: subjectIcon,
            color: subjectColor,
            price: subjectPrice,
            currency: 'INR',
            isLocked: false
          }
        });

        console.log(`     📚 Created subject: ${subjectName} (₹${subjectPrice / 100})`);

        // Process chapters
        for (const [chapterName, chapterData] of subjectData.chapters) {
          const dbChapter = await prisma.chapter.create({
            data: {
              name: chapterName,
              subjectId: dbSubject.id,
              orderIndex: chapterData.order
            }
          });

          console.log(`       📖 Created chapter: ${chapterName}`);

          // Process topics
          for (const topicData of chapterData.topics) {
            const dbTopic = await prisma.topic.create({
              data: {
                name: topicData.name,
                description: topicData.description,
                chapterId: dbChapter.id,
                orderIndex: topicData.order,
                type: convertToTopicType(topicData.type),
                duration: "5 min" // Default duration
              }
            });

            // Create topic content
            await prisma.topicContent.create({
              data: {
                topicId: dbTopic.id,
                contentType: convertToContentType(topicData.contentType),
                url: topicData.contentUrl
              }
            });

            console.log(`         🎯 Created topic: ${topicData.name}`);
          }
        }
      }

      console.log(`   ✅ Completed ${className}: ${classData.subjects.size} subjects\n`);
    }

    // Final verification
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
