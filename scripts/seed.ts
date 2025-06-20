import { PrismaClient, TopicType, ContentType } from '@prisma/client';
import { classData } from '../data/classData';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seed...');

  // Clear existing data in correct order (respecting foreign key constraints)
  await prisma.userTopicProgress.deleteMany();
  await prisma.topicContent.deleteMany();
  await prisma.topic.deleteMany();
  await prisma.chapter.deleteMany();
  await prisma.subject.deleteMany();
  await prisma.class.deleteMany();

  console.log('Cleared existing data');

  // Helper function to convert topic type to enum
  const convertTopicType = (type: string): TopicType => {
    switch (type.toLowerCase()) {
      case 'video': return 'VIDEO';
      case 'interactive': return 'INTERACTIVE';
      case 'exercise': return 'EXERCISE';
      case 'audio': return 'AUDIO';
      default: return 'VIDEO';
    }
  };

  // Helper function to convert content type to enum
  const convertContentType = (type: string): ContentType => {
    switch (type.toLowerCase()) {
      case 'external_link': return 'EXTERNAL_LINK';
      case 'video': return 'VIDEO';
      case 'pdf': return 'PDF';
      case 'text': return 'TEXT';
      case 'interactive_widget': return 'INTERACTIVE_WIDGET';
      default: return 'EXTERNAL_LINK';
    }
  };

  // Seed classes
  for (const [classId, classInfo] of Object.entries(classData)) {
    const classRecord = await prisma.class.create({
      data: {
        id: parseInt(classId),
        name: classInfo.name,
        description: classInfo.description,
        isActive: true,
      },
    });

    console.log(`Created class: ${classInfo.name}`);

    // Seed subjects
    for (let subjectIndex = 0; subjectIndex < classInfo.subjects.length; subjectIndex++) {
      const subject = classInfo.subjects[subjectIndex];
      
      const subjectRecord = await prisma.subject.create({
        data: {
          name: subject.name,
          icon: subject.icon,
          color: subject.color,
          isLocked: subject.isLocked,
          orderIndex: subjectIndex,
          classId: classRecord.id,
        },
      });

      console.log(`  Created subject: ${subject.name}`);

      // Seed chapters
      for (let chapterIndex = 0; chapterIndex < subject.chapters.length; chapterIndex++) {
        const chapter = subject.chapters[chapterIndex];
        
        const chapterRecord = await prisma.chapter.create({
          data: {
            name: chapter.name,
            orderIndex: chapterIndex,
            subjectId: subjectRecord.id,
          },
        });

        console.log(`    Created chapter: ${chapter.name}`);

        // Seed topics
        for (let topicIndex = 0; topicIndex < chapter.topics.length; topicIndex++) {
          const topic = chapter.topics[topicIndex];
          
          const topicRecord = await prisma.topic.create({
            data: {
              name: topic.name,
              type: convertTopicType(topic.type),
              duration: topic.duration,
              orderIndex: topicIndex,
              chapterId: chapterRecord.id,
            },
          });

          console.log(`      Created topic: ${topic.name}`);

          // Only create content if topic has a 'content' property
          if (
            'content' in topic &&
            topic.content &&
            (
              (topic.content as any).url ||
              (topic.content as any).videoUrl ||
              (topic.content as any).pdfUrl ||
              (topic.content as any).textContent
            )
          ) {
            await prisma.topicContent.create({
              data: {
                topicId: topicRecord.id,
                contentType: convertContentType((topic.content as any).type),
                url: (topic.content as any).url || null,
                videoUrl: (topic.content as any).videoUrl || null,
                pdfUrl: (topic.content as any).pdfUrl || null,
                textContent: (topic.content as any).textContent || null,
                widgetConfig: (topic.content as any).widgetConfig || null,
              },
            });

            console.log(`        Created content for: ${topic.name}`);
          } else {
            // Create default text content if no content is provided
            await prisma.topicContent.create({
              data: {
                topicId: topicRecord.id,
                contentType: 'TEXT',
                textContent: `Content for ${topic.name} will be available soon.`,
              },
            });

            console.log(`        Created default content for: ${topic.name}`);
          }
        }
      }
    }
  }

  console.log('Database seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
