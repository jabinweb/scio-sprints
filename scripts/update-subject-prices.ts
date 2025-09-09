import { prisma } from '../lib/prisma';

async function updateSubjectPrices() {
  try {
    console.log('Updating subject and class prices for existing classes...');

    // Define class prices (in paisa)
    const classPrices = {
      'Class 4': 69900,  // ₹699
      'Class 5': 69900,  // ₹699
      'Class 6': 89900,  // ₹899
      'Class 7': 89900,  // ₹899
      'Class 8': 89900,  // ₹899
    };

    // Define pricing structure based on your requirements (prices in paisa)
    const classSubjectPrices = {
      'Class 4': {
        'EVS': 29900,     // ₹299
        'English': 24900, // ₹249
        'Maths': 29900,   // ₹299
      },
      'Class 5': {
        'EVS': 29900,        // ₹299
        'English': 24900,    // ₹249
        'Mathematics': 29900, // ₹299 (note: it's "Mathematics" in the DB, not "Maths")
      },
      'Class 6': {
        'English': 29900,       // ₹299
        'Science': 29900,       // ₹299
        'Social Studies': 29900, // ₹299
        'Mathematics': 29900,   // ₹299
      },
      'Class 7': {
        'English': 29900,       // ₹299
        'Science': 29900,       // ₹299
        'Social Studies': 29900, // ₹299
        'Mathematics': 29900,   // ₹299
      },
      'Class 8': {
        'English': 29900,       // ₹299
        'Science': 29900,       // ₹299
        'Social Studies': 29900, // ₹299
        'Mathematics': 29900,   // ₹299
      }
    };

    // Get all classes with their subjects
    const classes = await prisma.class.findMany({
      include: {
        subjects: true
      }
    });

    let updatedCount = 0;
    let updatedClassCount = 0;

    for (const classItem of classes) {
      const className = classItem.name;
      console.log(`\nProcessing ${className}...`);
      
      // Update class price if we have one defined
      if (classPrices[className as keyof typeof classPrices]) {
        const newClassPrice = classPrices[className as keyof typeof classPrices];
        
        await prisma.class.update({
          where: { id: classItem.id },
          data: { price: newClassPrice }
        });
        
        console.log(`  ✓ Updated ${className} price: ₹${newClassPrice / 100}`);
        updatedClassCount++;
      }
      
      // Check if we have pricing for this class
      if (classSubjectPrices[className as keyof typeof classSubjectPrices]) {
        const subjectPrices = classSubjectPrices[className as keyof typeof classSubjectPrices];
        
        for (const subject of classItem.subjects) {
          // Find matching subject price
          let price = null;
          
          // Try exact match first
          if (subjectPrices[subject.name as keyof typeof subjectPrices]) {
            price = subjectPrices[subject.name as keyof typeof subjectPrices];
          } else {
            // Try partial match for variations like "Mathematics" vs "Maths"
            for (const [subjectKey, subjectPrice] of Object.entries(subjectPrices)) {
              if (subject.name.toLowerCase().includes(subjectKey.toLowerCase()) || 
                  subjectKey.toLowerCase().includes(subject.name.toLowerCase())) {
                price = subjectPrice;
                break;
              }
            }
          }
          
          if (price) {
            await prisma.subject.update({
              where: { id: subject.id },
              data: { price }
            });
            
            console.log(`  ✓ Updated ${subject.name}: ₹${price / 100}`);
            updatedCount++;
          } else {
            console.log(`  ⚠ No pricing found for ${subject.name} in ${className}`);
          }
        }
      } else {
        console.log(`  ⚠ No pricing configuration found for ${className}`);
      }
    }

    console.log(`\n✅ Successfully updated ${updatedClassCount} classes and ${updatedCount} subjects with new prices!`);
  } catch (error) {
    console.error('❌ Error updating subject prices:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateSubjectPrices();
