const fs = require('fs');
const path = require('path');
const database = require('./mysql-database');
require('dotenv').config();

async function setupDatabase() {
    console.log('🚀 Starting MySQL database setup...');
    
    try {
        // Check if database exists, if not create it
        const dbExists = await database.databaseExists();
        if (!dbExists) {
            console.log('📦 Creating database...');
            await database.createDatabase();
        } else {
            console.log('✅ Database already exists');
        }

        // Connect to the database
        console.log('🔌 Connecting to MySQL database...');
        await database.connect();

        // Read and execute schema
        console.log('📋 Reading schema file...');
        const schemaPath = path.join(__dirname, 'schema.sql');
        const schema = fs.readFileSync(schemaPath, 'utf8');

        // Split schema into individual statements
        const statements = schema
            .split(';')
            .map(stmt => stmt.trim())
            .filter(stmt => stmt.length > 0 && !stmt.startsWith('--') && !stmt.startsWith('CREATE DATABASE') && !stmt.startsWith('USE'));

        console.log(`📝 Executing ${statements.length} SQL statements...`);

        // Execute each statement
        for (let i = 0; i < statements.length; i++) {
            const statement = statements[i];
            if (statement.trim()) {
                try {
                    await database.query(statement);
                    console.log(`✅ Statement ${i + 1}/${statements.length} executed successfully`);
                } catch (error) {
                    // Skip if table already exists
                    if (error.code === 'ER_TABLE_EXISTS_ERROR') {
                        console.log(`⚠️  Table already exists, skipping statement ${i + 1}`);
                        continue;
                    }
                    console.error(`❌ Error executing statement ${i + 1}:`, error.message);
                    console.error('Statement:', statement);
                    throw error;
                }
            }
        }

        // Verify tables were created
        console.log('🔍 Verifying tables...');
        const tables = await database.query('SHOW TABLES');
        console.log(`✅ Created ${tables.length} tables:`);
        tables.forEach(table => {
            const tableName = Object.values(table)[0];
            console.log(`   - ${tableName}`);
        });

        // Create default admin user if not exists
        console.log('👤 Checking for admin user...');
        const adminExists = await database.select('users', { role: 'SUPER_ADMIN' });
        
        if (adminExists.length === 0) {
            console.log('👤 Creating default admin user...');
            const bcrypt = require('bcryptjs');
            const hashedPassword = await bcrypt.hash('admin123', 12);
            
            await database.insert('users', {
                email: 'admin@edu-les.com',
                username: 'admin',
                first_name: 'System',
                last_name: 'Administrator',
                role: 'SUPER_ADMIN',
                status: 'ACTIVE',
                is_active: true,
                is_email_verified: true,
                email_verified_at: new Date(),
                password: hashedPassword
            });
            
            console.log('✅ Default admin user created');
            console.log('📧 Email: admin@edu-les.com');
            console.log('🔑 Password: admin123');
        } else {
            console.log('✅ Admin user already exists');
        }

        // Create default categories
        console.log('📂 Checking for default categories...');
        const categoriesExist = await database.select('categories');
        
        if (categoriesExist.length === 0) {
            console.log('📂 Creating default categories...');
            const defaultCategories = [
                {
                    name: 'البرمجة',
                    description: 'دورات تعليم البرمجة وتطوير البرمجيات',
                    icon: 'code',
                    color: '#3B82F6'
                },
                {
                    name: 'الرياضيات',
                    description: 'دورات الرياضيات والحساب',
                    icon: 'calculator',
                    color: '#10B981'
                },
                {
                    name: 'العلوم',
                    description: 'دورات العلوم الطبيعية والفيزياء والكيمياء',
                    icon: 'flask',
                    color: '#8B5CF6'
                },
                {
                    name: 'اللغات',
                    description: 'دورات تعليم اللغات المختلفة',
                    icon: 'language',
                    color: '#F59E0B'
                },
                {
                    name: 'التاريخ',
                    description: 'دورات التاريخ والحضارات',
                    icon: 'book',
                    color: '#EF4444'
                }
            ];

            for (const category of defaultCategories) {
                await database.insert('categories', category);
            }
            
            console.log(`✅ Created ${defaultCategories.length} default categories`);
        } else {
            console.log('✅ Categories already exist');
        }

        console.log('🎉 MySQL database setup completed successfully!');
        console.log('');
        console.log('📊 Database Summary:');
        console.log(`   - Database: ${process.env.DB_NAME || 'edu_les'}`);
        console.log(`   - Host: ${process.env.DB_HOST || 'localhost'}`);
        console.log(`   - Port: ${process.env.DB_PORT || 3306}`);
        console.log(`   - Tables: ${tables.length}`);
        console.log('');
        console.log('🔐 Default Admin Credentials:');
        console.log('   - Email: admin@edu-les.com');
        console.log('   - Password: admin123');
        console.log('');
        console.log('⚠️  Remember to change the admin password after first login!');

    } catch (error) {
        console.error('❌ Database setup failed:', error.message);
        console.error(error.stack);
        process.exit(1);
    } finally {
        await database.disconnect();
    }
}

// Run setup if this file is executed directly
if (require.main === module) {
    setupDatabase();
}

module.exports = { setupDatabase };