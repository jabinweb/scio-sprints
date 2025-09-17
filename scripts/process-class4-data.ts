import { PrismaClient, TopicType, ContentType } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

interface CSVRow {
  class_name: string;
  subject_name: string;
  subject_order: number;
  chapter_name: string;
  chapter_order: number;
  topic_name: string;
  topic_type: string;
  topic_description: string;
  content_type: string;
  content_url: string;
}

async function parseCSV(filePath: string): Promise<CSVRow[]> {
  const csvContent = fs.readFileSync(filePath, 'utf-8');
  const lines = csvContent.split('\n').filter(line => line.trim() !== '');
  const headers = lines[0].split(',');
  
  const rows: CSVRow[] = [];
  
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    if (values.length === headers.length) {
      const row: CSVRow = {
        class_name: values[0],
        subject_name: values[1],
        subject_order: parseInt(values[2]),
        chapter_name: values[3],
        chapter_order: parseInt(values[4]),
        topic_name: values[5],
        topic_type: values[6],
        topic_description: values[7],
        content_type: values[8],
        content_url: values[9]
      };
      rows.push(row);
    }
  }
  
  return rows;
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  result.push(current.trim());
  return result;
}

async function processClass4Data() {
  try {
    console.log('Starting Class 4 data processing...');
    
    const csvPath = path.join(__dirname, '..', 'templates', 'ScioSprints - Bulk Upload - Class 4.csv');
    const data = await parseCSV(csvPath);
    
    console.log(`Found ${data.length} rows to process`);
    
    for (const row of data) {
      console.log(`Processing: ${row.class_name} -> ${row.subject_name} -> ${row.chapter_name} -> ${row.topic_name}`);
      
      // Find or create/update class
      let classRecord = await prisma.class.findFirst({
        where: { name: row.class_name }
      });
      
      if (!classRecord) {
        classRecord = await prisma.class.create({
          data: {
            name: row.class_name,
            description: `Educational content for ${row.class_name}`
          }
        });
        console.log(`  Created class: ${classRecord.name}`);
      }
      
      // Find or create/update subject
      let subjectRecord = await prisma.subject.findFirst({
        where: {
          name: row.subject_name,
          classId: classRecord.id
        }
      });
      
      if (!subjectRecord) {
        subjectRecord = await prisma.subject.create({
          data: {
            name: row.subject_name,
            classId: classRecord.id,
            orderIndex: row.subject_order,
            icon: 'default-icon',
            color: '#4F46E5'
          }
        });
        console.log(`  Created subject: ${subjectRecord.name}`);
      } else {
        // Update existing subject with new order
        subjectRecord = await prisma.subject.update({
          where: { id: subjectRecord.id },
          data: {
            orderIndex: row.subject_order
          }
        });
        console.log(`  Updated subject: ${subjectRecord.name}`);
      }
      
      // Find or create/update chapter
      let chapterRecord = await prisma.chapter.findFirst({
        where: {
          name: row.chapter_name,
          subjectId: subjectRecord.id
        }
      });
      
      if (!chapterRecord) {
        chapterRecord = await prisma.chapter.create({
          data: {
            name: row.chapter_name,
            subjectId: subjectRecord.id,
            orderIndex: row.chapter_order
          }
        });
        console.log(`  Created chapter: ${chapterRecord.name}`);
      } else {
        // Update existing chapter with new order
        chapterRecord = await prisma.chapter.update({
          where: { id: chapterRecord.id },
          data: {
            orderIndex: row.chapter_order
          }
        });
        console.log(`  Updated chapter: ${chapterRecord.name}`);
      }
      
      // Find or create/update topic
      let topicRecord = await prisma.topic.findFirst({
        where: {
          name: row.topic_name,
          chapterId: chapterRecord.id
        }
      });
      
      if (!topicRecord) {
        topicRecord = await prisma.topic.create({
          data: {
            name: row.topic_name,
            chapterId: chapterRecord.id,
            type: row.topic_type as TopicType,
            description: row.topic_description,
            orderIndex: 1
          }
        });
        console.log(`  Created topic: ${topicRecord.name}`);
      } else {
        // Update existing topic with new data
        topicRecord = await prisma.topic.update({
          where: { id: topicRecord.id },
          data: {
            type: row.topic_type as TopicType,
            description: row.topic_description,
            orderIndex: 1
          }
        });
        console.log(`  Updated topic: ${topicRecord.name}`);
      }
      
      // Create or update topic content - Always override existing data
      const existingContent = await prisma.topicContent.findFirst({
        where: {
          topicId: topicRecord.id
        }
      });
      
      // Map content type to enum value
      let contentType: ContentType;
      switch (row.content_type.toUpperCase()) {
        case 'IFRAME':
          contentType = ContentType.IFRAME;
          break;
        case 'VIDEO':
          contentType = ContentType.VIDEO;
          break;
        case 'PDF':
          contentType = ContentType.PDF;
          break;
        case 'TEXT':
          contentType = ContentType.TEXT;
          break;
        case 'INTERACTIVE_WIDGET':
          contentType = ContentType.INTERACTIVE_WIDGET;
          break;
        default:
          contentType = ContentType.EXTERNAL_LINK;
      }
      
      const contentData = {
        topicId: topicRecord.id,
        contentType: contentType,
        textContent: row.content_url, // Store iframe HTML in textContent field
        url: null, // Clear URL field since we're using textContent for iframe
      };
      
      if (existingContent) {
        await prisma.topicContent.update({
          where: { id: existingContent.id },
          data: contentData
        });
        console.log(`  Updated content for topic: ${topicRecord.name}`);
      } else {
        await prisma.topicContent.create({
          data: contentData
        });
        console.log(`  Created content for topic: ${topicRecord.name}`);
      }
    }
    
    console.log('Class 4 data processing completed successfully!');
    
  } catch (error) {
    console.error('Error processing Class 4 data:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
if (require.main === module) {
  processClass4Data()
    .then(() => {
      console.log('Script completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Script failed:', error);
      process.exit(1);
    });
}

export default processClass4Data;