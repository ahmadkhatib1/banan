require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { pool } = require('../config/database');

const runMigration = async () => {
  try {
    console.log('🚀 Starting database migration...');
    
    // Read the schema file
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    // Split the schema into individual statements
    const statements = schema
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0);
    
    // Execute each statement
    for (const statement of statements) {
      try {
        await pool.execute(statement);
        console.log('✅ Executed statement successfully');
      } catch (error) {
        if (error.code === 'ER_DB_CREATE_EXISTS' || error.code === 'ER_TABLE_EXISTS_ERROR') {
          console.log('⚠️  Database/Table already exists, skipping...');
        } else {
          console.error('❌ Error executing statement:', error.message);
          throw error;
        }
      }
    }
    
    console.log('🎉 Database migration completed successfully!');
    
    // Insert default categories
    await insertDefaultData();
    
  } catch (error) {
    console.error('💥 Migration failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
};

const insertDefaultData = async () => {
  try {
    console.log('📝 Inserting default data...');
    
    // Default categories
    const categories = [
      { name: 'البرمجة', description: 'دورات البرمجة وتطوير البرمجيات', icon: '💻', color: '#3B82F6' },
      { name: 'الرياضيات', description: 'دورات الرياضيات والحساب', icon: '🔢', color: '#10B981' },
      { name: 'العلوم', description: 'دورات العلوم الطبيعية', icon: '🔬', color: '#8B5CF6' },
      { name: 'اللغات', description: 'دورات تعلم اللغات', icon: '🗣️', color: '#F59E0B' },
      { name: 'التصميم', description: 'دورات التصميم والفنون', icon: '🎨', color: '#EF4444' },
      { name: 'الأعمال', description: 'دورات إدارة الأعمال والتسويق', icon: '💼', color: '#6366F1' }
    ];
    
    for (const category of categories) {
      try {
        await pool.execute(
          'INSERT INTO categories (name, description, icon, color) VALUES (?, ?, ?, ?)',
          [category.name, category.description, category.icon, category.color]
        );
        console.log(`✅ Inserted category: ${category.name}`);
      } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
          console.log(`⚠️  Category ${category.name} already exists, skipping...`);
        } else {
          throw error;
        }
      }
    }
    
    // Create default admin user
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash('admin123', 12);
    
    try {
      await pool.execute(
        `INSERT INTO users (email, username, first_name, last_name, role, status, is_active, is_email_verified, password) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          'admin@edu-les.com',
          'admin',
          'مدير',
          'النظام',
          'SUPER_ADMIN',
          'ACTIVE',
          true,
          true,
          hashedPassword
        ]
      );
      console.log('✅ Created default admin user (admin@edu-les.com / admin123)');
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        console.log('⚠️  Admin user already exists, skipping...');
      } else {
        throw error;
      }
    }
    
    console.log('🎉 Default data inserted successfully!');
    
  } catch (error) {
    console.error('❌ Error inserting default data:', error);
    throw error;
  }
};

// Run migration if this file is executed directly
if (require.main === module) {
  runMigration();
}

module.exports = { runMigration, insertDefaultData };