import { prisma } from '../lib/prisma';

async function checkCurrentData() {
  try {
    console.log('Checking current classes and subjects in the database...\n');

    // Get all classes with their subjects
    const classes = await prisma.class.findMany({
      include: {
        subjects: {
          orderBy: { orderIndex: 'asc' }
        }
      },
      orderBy: { id: 'asc' }
    });

    if (classes.length === 0) {
      console.log('No classes found in the database.');
      return;
    }

    for (const classData of classes) {
      console.log(`\n📚 ${classData.name} - Current Price: ₹${(classData.price || 0) / 100}`);
      console.log(`   Description: ${classData.description}`);
      console.log(`   Active: ${classData.isActive}`);
      
      if (classData.subjects.length === 0) {
        console.log('   No subjects found for this class.');
      } else {
        console.log('   Subjects:');
        for (const subject of classData.subjects) {
          const currentPrice = subject.price ? `₹${subject.price / 100}` : 'No price set';
          console.log(`   - ${subject.name} (${subject.icon}) - Current Price: ${currentPrice}`);
        }
      }
      console.log('   ' + '-'.repeat(50));
    }

    console.log(`\n✅ Found ${classes.length} classes with a total of ${classes.reduce((acc, c) => acc + c.subjects.length, 0)} subjects.`);
  } catch (error) {
    console.error('Error checking current data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkCurrentData();
