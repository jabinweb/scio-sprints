import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

interface ContentData {
  contentType: string;
  url?: string;
  videoUrl?: string;
  pdfUrl?: string;
  textContent?: string;
}

interface TopicData {
  name: string;
  type: string;
  duration?: string;
  orderIndex: number;
  description?: string;
  content: ContentData;
}

interface ChapterData {
  name: string;
  orderIndex: number;
  topics: TopicData[];
}

interface SubjectData {
  name: string;
  icon: string;
  color: string;
  orderIndex: number;
  currency: string;
  price: number;
  chapters: ChapterData[];
}

interface ClassData {
  name: string;
  description: string;
  currency: string;
  price: number;
  subjects: SubjectData[];
}

interface BulkUploadData {
  classes: ClassData[];
}

async function bulkUploadFromJSON() {
  console.log('🌱 Starting bulk upload from JSON...\n');

  try {
    // Read the JSON file
    const jsonPath = path.join(process.cwd(), 'templates', 'bulk-upload-template.json');
    const jsonData: BulkUploadData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

    console.log(`📋 Processing ${jsonData.classes.length} classes...\n`);

    for (const classData of jsonData.classes) {
      console.log(`📚 Creating/updating ${classData.name}...`);

      // Check if class exists, then update or create
      const existingClass = await prisma.class.findFirst({
        where: { name: classData.name }
      });

      let createdClass;
      if (existingClass) {
        // Update existing class
        createdClass = await prisma.class.update({
          where: { id: existingClass.id },
          data: {
            description: classData.description,
            price: classData.price,
            currency: classData.currency,
            isActive: true
          }
        });
        console.log(`  ✅ Updated existing ${classData.name}`);
      } else {
        // Create new class
        createdClass = await prisma.class.create({
          data: {
            name: classData.name,
            description: classData.description,
            price: classData.price,
            currency: classData.currency,
            isActive: true
          }
        });
        console.log(`  ✅ Created new ${classData.name}`);
      }

      // Process subjects
      for (const subjectData of classData.subjects) {
        console.log(`    📖 Creating/updating subject: ${subjectData.name}`);

        const existingSubject = await prisma.subject.findFirst({
          where: {
            name: subjectData.name,
            classId: createdClass.id
          }
        });

        let createdSubject;
        if (existingSubject) {
          // Update existing subject
          createdSubject = await prisma.subject.update({
            where: { id: existingSubject.id },
            data: {
              icon: subjectData.icon,
              color: subjectData.color,
              price: subjectData.price,
              currency: subjectData.currency,
              orderIndex: subjectData.orderIndex,
              isLocked: false
            }
          });
          console.log(`      ✅ Updated existing subject: ${subjectData.name}`);
        } else {
          // Create new subject
          createdSubject = await prisma.subject.create({
            data: {
              name: subjectData.name,
              icon: subjectData.icon,
              color: subjectData.color,
              price: subjectData.price,
              currency: subjectData.currency,
              orderIndex: subjectData.orderIndex,
              classId: createdClass.id,
              isLocked: false
            }
          });
          console.log(`      ✅ Created new subject: ${subjectData.name}`);
        }

        // Process chapters
        for (const chapterData of subjectData.chapters) {
          console.log(`      📝 Creating/updating chapter: ${chapterData.name}`);

          const existingChapter = await prisma.chapter.findFirst({
            where: {
              name: chapterData.name,
              subjectId: createdSubject.id
            }
          });

          let createdChapter;
          if (existingChapter) {
            // Update existing chapter
            createdChapter = await prisma.chapter.update({
              where: { id: existingChapter.id },
              data: {
                orderIndex: chapterData.orderIndex
              }
            });
            console.log(`        ✅ Updated existing chapter: ${chapterData.name}`);
          } else {
            // Create new chapter
            createdChapter = await prisma.chapter.create({
              data: {
                name: chapterData.name,
                orderIndex: chapterData.orderIndex,
                subjectId: createdSubject.id
              }
            });
            console.log(`        ✅ Created new chapter: ${chapterData.name}`);
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
                  type: topicData.type as any,
                  duration: topicData.duration,
                  orderIndex: topicData.orderIndex,
                  description: topicData.description
                }
              });

              // Update topic content - handle IFRAME content specially
              const contentUpdate = {
                contentType: topicData.content.contentType as 'EXTERNAL_LINK' | 'VIDEO' | 'PDF' | 'TEXT' | 'INTERACTIVE_WIDGET' | 'IFRAME',
                url: topicData.content.contentType === 'IFRAME' ? null : topicData.content.url,
                videoUrl: topicData.content.contentType === 'IFRAME' ? null : topicData.content.videoUrl,
                pdfUrl: topicData.content.contentType === 'IFRAME' ? null : topicData.content.pdfUrl,
                textContent: topicData.content.contentType === 'IFRAME' 
                  ? (topicData.content.url || topicData.content.textContent) 
                  : topicData.content.textContent
              };

              await prisma.topicContent.upsert({
                where: { topicId: existingTopic.id },
                update: contentUpdate,
                create: {
                  topicId: existingTopic.id,
                  ...contentUpdate
                }
              });
              console.log(`          ✅ Updated existing topic: ${topicData.name}`);
            } else {
              // Create new topic with content
              await prisma.topic.create({
                data: {
                  name: topicData.name,
                  type: topicData.type as any,
                  duration: topicData.duration,
                  orderIndex: topicData.orderIndex,
                  description: topicData.description,
                  chapterId: createdChapter.id,
                  content: {
                    create: {
                      contentType: topicData.content.contentType as any,
                      url: topicData.content.url,
                      videoUrl: topicData.content.videoUrl,
                      pdfUrl: topicData.content.pdfUrl,
                      textContent: topicData.content.textContent
                    }
                  }
                }
              });
              console.log(`          ✅ Created new topic: ${topicData.name}`);
            }
          }
        }
      }

      console.log(`✅ ${classData.name} processed with ${classData.subjects.length} subjects\n`);
    }

    console.log('\n🎉 Bulk upload completed successfully!');

    // Summary
    const classCount = await prisma.class.count();
    const subjectCount = await prisma.subject.count();
    const chapterCount = await prisma.chapter.count();
    const topicCount = await prisma.topic.count();

    console.log('\n📊 Final Summary:');
    console.log(`• Total Classes: ${classCount}`);
    console.log(`• Total Subjects: ${subjectCount}`);
    console.log(`• Total Chapters: ${chapterCount}`);
    console.log(`• Total Topics: ${topicCount}`);
    console.log('\n🚀 Database is now populated with IFRAME-based educational content!');

  } catch (error) {
    console.error('❌ Error during bulk upload:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the bulk upload
bulkUploadFromJSON()
  .catch((e) => {
    console.error('❌ Bulk upload failed:', e);
    process.exit(1);
  });

export default bulkUploadFromJSON;