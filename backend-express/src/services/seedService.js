const bcrypt = require('bcryptjs');
const database = require('../database/mysql-database');

class SeedService {
    constructor() {
        this.categories = [
            { name: 'البرمجة', description: 'دورات في البرمجة وتطوير البرمجيات', color: '#3498db' },
            { name: 'التصميم', description: 'دورات في التصميم الجرافيكي وتصميم المواقع', color: '#e74c3c' },
            { name: 'التسويق الرقمي', description: 'دورات في التسويق الإلكتروني ووسائل التواصل', color: '#f39c12' },
            { name: 'إدارة الأعمال', description: 'دورات في إدارة الأعمال والقيادة', color: '#2ecc71' },
            { name: 'اللغات', description: 'دورات تعلم اللغات المختلفة', color: '#9b59b6' }
        ];

        this.courses = [
            {
                title: 'أساسيات البرمجة بـ JavaScript',
                description: 'تعلم أساسيات البرمجة باستخدام لغة JavaScript من الصفر',
                price: 299.99,
                duration: 40,
                level: 'beginner',
                category: 'البرمجة',
                image_url: 'https://via.placeholder.com/400x300/3498db/ffffff?text=JavaScript'
            },
            {
                title: 'تطوير المواقع بـ React',
                description: 'دورة شاملة في تطوير واجهات المستخدم باستخدام React',
                price: 499.99,
                duration: 60,
                level: 'intermediate',
                category: 'البرمجة',
                image_url: 'https://via.placeholder.com/400x300/61dafb/000000?text=React'
            },
            {
                title: 'تصميم المواقع بـ Figma',
                description: 'تعلم تصميم واجهات المستخدم الحديثة باستخدام Figma',
                price: 199.99,
                duration: 25,
                level: 'beginner',
                category: 'التصميم',
                image_url: 'https://via.placeholder.com/400x300/f24e1e/ffffff?text=Figma'
            },
            {
                title: 'التسويق عبر وسائل التواصل الاجتماعي',
                description: 'استراتيجيات التسويق الفعالة عبر منصات التواصل الاجتماعي',
                price: 349.99,
                duration: 35,
                level: 'intermediate',
                category: 'التسويق الرقمي',
                image_url: 'https://via.placeholder.com/400x300/f39c12/ffffff?text=Social+Media'
            },
            {
                title: 'إدارة المشاريع الرقمية',
                description: 'تعلم إدارة المشاريع الرقمية باستخدام أحدث الأدوات والتقنيات',
                price: 399.99,
                duration: 45,
                level: 'advanced',
                category: 'إدارة الأعمال',
                image_url: 'https://via.placeholder.com/400x300/2ecc71/ffffff?text=Project+Management'
            },
            {
                title: 'تعلم اللغة الإنجليزية للمبتدئين',
                description: 'دورة شاملة لتعلم اللغة الإنجليزية من الأساسيات',
                price: 249.99,
                duration: 50,
                level: 'beginner',
                category: 'اللغات',
                image_url: 'https://via.placeholder.com/400x300/9b59b6/ffffff?text=English'
            }
        ];

        this.users = [
            {
                first_name: 'أحمد',
                last_name: 'محمد',
                username: 'ahmed_instructor',
                email: 'ahmed@example.com',
                password: 'password123',
                role: 'INSTRUCTOR',
                is_email_verified: true
            },
            {
                first_name: 'فاطمة',
                last_name: 'علي',
                username: 'fatima_instructor',
                email: 'fatima@example.com',
                password: 'password123',
                role: 'INSTRUCTOR',
                is_email_verified: true
            },
            {
                first_name: 'محمد',
                last_name: 'حسن',
                username: 'mohammed_student',
                email: 'mohammed@example.com',
                password: 'password123',
                role: 'STUDENT',
                is_email_verified: true
            },
            {
                first_name: 'عائشة',
                last_name: 'أحمد',
                username: 'aisha_student',
                email: 'aisha@example.com',
                password: 'password123',
                role: 'STUDENT',
                is_email_verified: true
            },
            {
                first_name: 'خالد',
                last_name: 'سالم',
                username: 'khalid_student',
                email: 'khalid@example.com',
                password: 'password123',
                role: 'STUDENT',
                is_email_verified: true
            }
        ];
    }

    async seedCategories() {
        console.log('🌱 إنشاء الفئات...');
        
        for (const category of this.categories) {
            try {
                const existing = await database.query('SELECT id FROM categories WHERE name = ?', [category.name]);
                if (existing.length === 0) {
                    await database.query(
                        'INSERT INTO categories (name, description, color) VALUES (?, ?, ?)',
                        [category.name, category.description, category.color]
                    );
                    console.log(`✅ تم إنشاء فئة: ${category.name}`);
                } else {
                    console.log(`⚠️ الفئة موجودة بالفعل: ${category.name}`);
                }
            } catch (error) {
                console.error(`❌ خطأ في إنشاء فئة ${category.name}:`, error.message);
            }
        }
    }

    async seedUsers() {
        console.log('🌱 إنشاء المستخدمين...');
        
        // Create super admin first
        const existing = await database.query('SELECT id FROM users WHERE email = ?', ['admin@example.com']);
        if (existing.length === 0) {
            const hashedPassword = await bcrypt.hash('admin123', 10);
            const result = await database.query(
                'INSERT INTO users (email, username, first_name, last_name, password, role, is_email_verified, email_verified_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                ['admin@example.com', 'admin', 'Super', 'Admin', hashedPassword, 'SUPER_ADMIN', 1, new Date()]
            );
            console.log('✅ تم إنشاء المسؤول الأعلى');
        }
        
        for (const user of this.users) {
            try {
                const existing = await database.query('SELECT id FROM users WHERE email = ?', [user.email]);
                if (existing.length === 0) {
                    const hashedPassword = await bcrypt.hash(user.password, 10);
                    await database.query(
                        'INSERT INTO users (first_name, last_name, username, email, password, role, is_email_verified, email_verified_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                        [user.first_name, user.last_name, user.username, user.email, hashedPassword, user.role, user.is_email_verified, new Date()]
                    );
                    console.log(`✅ تم إنشاء مستخدم: ${user.first_name} ${user.last_name} (${user.role})`);
                } else {
                    console.log(`⚠️ المستخدم موجود بالفعل: ${user.email}`);
                }
            } catch (error) {
                console.error(`❌ خطأ في إنشاء مستخدم ${user.username}:`, error.message);
            }
        }
    }

    async seedCourses() {
        console.log('🌱 إنشاء الدورات...');
        
        // Get categories and instructors
        const categories = await database.query('SELECT id, name FROM categories');
        const instructors = await database.query('SELECT id, first_name, last_name FROM users WHERE role = ?', ['INSTRUCTOR']);
        
        if (instructors.length === 0) {
            console.log('⚠️ لا يوجد مدربين في النظام، سيتم تخطي إنشاء الدورات');
            return;
        }

        for (const course of this.courses) {
            try {
                const existing = await database.query('SELECT id FROM courses WHERE title = ?', [course.title]);
                if (existing.length === 0) {
                    // Find category ID
                    const category = categories.find(cat => cat.name === course.category);
                    if (!category) {
                        console.log(`⚠️ لم يتم العثور على فئة: ${course.category}`);
                        continue;
                    }

                    // Assign random instructor
                    const instructor = instructors[Math.floor(Math.random() * instructors.length)];

                    const result = await database.query(
                        'INSERT INTO courses (title, description, price, duration, level, instructor_id, image_url, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                        [course.title, course.description, course.price, course.duration, course.level, instructor.id, course.image_url, 'published']
                    );

                    // Link course to category
                    await database.query(
                        'INSERT INTO course_categories (course_id, category_id) VALUES (?, ?)',
                        [result.insertId, category.id]
                    );

                    console.log(`✅ تم إنشاء دورة: ${course.title} - المدرب: ${instructor.first_name} ${instructor.last_name}`);
                } else {
                    console.log(`⚠️ الدورة موجودة بالفعل: ${course.title}`);
                }
            } catch (error) {
                console.error(`❌ خطأ في إنشاء دورة ${course.title}:`, error.message);
            }
        }
    }

    async seedLessons() {
        console.log('🌱 إنشاء الدروس...');
        
        const courses = await database.query('SELECT id, title FROM courses');
        
        const lessonTemplates = [
            { title: 'مقدمة', content: 'مقدمة شاملة عن الموضوع', video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', duration: 15 },
            { title: 'الأساسيات', content: 'تعلم الأساسيات والمفاهيم الأولية', video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', duration: 25 },
            { title: 'التطبيق العملي', content: 'تطبيق عملي على ما تم تعلمه', video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', duration: 30 },
            { title: 'أمثلة متقدمة', content: 'أمثلة متقدمة وحالات استخدام', video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', duration: 35 },
            { title: 'المراجعة والخلاصة', content: 'مراجعة شاملة وخلاصة الدورة', video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', duration: 20 }
        ];

        for (const course of courses) {
            try {
                for (let i = 0; i < lessonTemplates.length; i++) {
                    const lesson = lessonTemplates[i];
                    const existing = await database.query('SELECT id FROM lessons WHERE title = ? AND course_id = ?', [lesson.title, course.id]);
                    if (existing.length === 0) {
                        await database.query(
                            'INSERT INTO lessons (course_id, title, content, video_url, duration, order_index) VALUES (?, ?, ?, ?, ?, ?)',
                            [course.id, lesson.title, lesson.content, lesson.video_url, lesson.duration, i + 1]
                        );
                    }
                }
                console.log(`✅ تم إنشاء ${lessonTemplates.length} دروس للدورة: ${course.title}`);
            } catch (error) {
                console.error(`❌ خطأ في إنشاء دروس للدورة ${course.title}:`, error.message);
            }
        }
    }

    async seedEnrollments() {
        console.log('🌱 إنشاء التسجيلات...');
        
        const students = await database.query('SELECT id, first_name, last_name FROM users WHERE role = ?', ['STUDENT']);
        const courses = await database.query('SELECT id, title FROM courses');
        
        if (students.length === 0 || courses.length === 0) {
            console.log('⚠️ لا يوجد طلاب أو دورات في النظام');
            return;
        }

        // Enroll each student in 2-3 random courses
        for (const student of students) {
            const numEnrollments = Math.floor(Math.random() * 2) + 2; // 2-3 enrollments
            const shuffledCourses = [...courses].sort(() => 0.5 - Math.random());
            
            for (let i = 0; i < Math.min(numEnrollments, courses.length); i++) {
                const course = shuffledCourses[i];
                try {
                    const existing = await database.query('SELECT id FROM enrollments WHERE user_id = ? AND course_id = ?', [student.id, course.id]);
                    if (existing.length === 0) {
                        await database.query(
                            'INSERT INTO enrollments (user_id, course_id, enrollment_date, status) VALUES (?, ?, ?, ?)',
                            [student.id, course.id, new Date(), 'active']
                        );
                        console.log(`✅ تم تسجيل ${student.first_name} ${student.last_name} في دورة: ${course.title}`);
                    }
                } catch (error) {
                    console.error(`❌ خطأ في تسجيل ${student.first_name} في دورة ${course.title}:`, error.message);
                }
            }
        }
    }

    async seedProgress() {
        console.log('🌱 إنشاء تقدم الطلاب...');
        
        const enrollments = await database.query('SELECT user_id, course_id FROM enrollments');
        
        for (const enrollment of enrollments) {
            try {
                const lessons = await database.query('SELECT id FROM lessons WHERE course_id = ?', [enrollment.course_id]);
                
                // Complete 30-80% of lessons randomly
                const completionRate = Math.random() * 0.5 + 0.3; // 30-80%
                const lessonsToComplete = Math.floor(lessons.length * completionRate);
                
                for (let i = 0; i < lessonsToComplete; i++) {
                    const lessonId = lessons[i].id;
                    const existing = await database.query('SELECT id FROM progress WHERE user_id = ? AND lesson_id = ?', [enrollment.user_id, lessonId]);
                    if (existing.length === 0) {
                        const status = Math.random() > 0.2 ? 'completed' : 'in_progress';
                        const completedAt = status === 'completed' ? new Date() : null;
                        const timeSpent = Math.floor(Math.random() * 30) + 10; // 10-40 minutes
                        
                        await database.query(
                            'INSERT INTO progress (user_id, lesson_id, status, completed_at, time_spent) VALUES (?, ?, ?, ?, ?)',
                            [enrollment.user_id, lessonId, status, completedAt, timeSpent]
                        );
                    }
                }
                
                console.log(`✅ تم إنشاء تقدم للمستخدم ${enrollment.user_id} في الدورة ${enrollment.course_id} (${lessonsToComplete}/${lessons.length} دروس)`);
            } catch (error) {
                console.error(`❌ خطأ في إنشاء تقدم للتسجيل:`, error.message);
            }
        }
    }

    async clearAllData() {
        console.log('🗑️ حذف جميع البيانات الموجودة...');
        
        try {
            await database.query('DELETE FROM progress');
            await database.query('DELETE FROM enrollments');
            await database.query('DELETE FROM course_categories');
            await database.query('DELETE FROM lessons');
            await database.query('DELETE FROM courses');
            await database.query('DELETE FROM categories');
            await database.query('DELETE FROM users WHERE role != ?', ['SUPER_ADMIN']);
            
            console.log('✅ تم حذف جميع البيانات بنجاح');
        } catch (error) {
            console.error('❌ خطأ في حذف البيانات:', error.message);
        }
    }

    async seedAll(clearFirst = false) {
        try {
            console.log('🚀 بدء عملية إنشاء البيانات التجريبية...');
            
            if (clearFirst) {
                await this.clearAllData();
            }
            
            await this.seedCategories();
            await this.seedUsers();
            await this.seedCourses();
            await this.seedLessons();
            await this.seedEnrollments();
            await this.seedProgress();
            
            console.log('🎉 تم إنشاء جميع البيانات التجريبية بنجاح!');
            
            // Display summary
            const summary = await this.getSummary();
            console.log('\n📊 ملخص البيانات المُنشأة:');
            console.log(`👥 المستخدمين: ${summary.users}`);
            console.log(`📚 الفئات: ${summary.categories}`);
            console.log(`🎓 الدورات: ${summary.courses}`);
            console.log(`📖 الدروس: ${summary.lessons}`);
            console.log(`✍️ التسجيلات: ${summary.enrollments}`);
            console.log(`📈 سجلات التقدم: ${summary.progress}`);
            
        } catch (error) {
            console.error('❌ خطأ في عملية إنشاء البيانات:', error.message);
            throw error;
        }
    }

    async getSummary() {
        const users = await database.query('SELECT COUNT(*) as count FROM users');
        const categories = await database.query('SELECT COUNT(*) as count FROM categories');
        const courses = await database.query('SELECT COUNT(*) as count FROM courses');
        const lessons = await database.query('SELECT COUNT(*) as count FROM lessons');
        const enrollments = await database.query('SELECT COUNT(*) as count FROM enrollments');
        const progress = await database.query('SELECT COUNT(*) as count FROM progress');
        
        return {
            users: users[0].count,
            categories: categories[0].count,
            courses: courses[0].count,
            lessons: lessons[0].count,
            enrollments: enrollments[0].count,
            progress: progress[0].count
        };
    }
}

module.exports = SeedService;