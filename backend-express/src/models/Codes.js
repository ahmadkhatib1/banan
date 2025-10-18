

const CODES_TYPE = {
    ACTIVATE: 'ACTIVATE',
    RESET_PASS: 'RESET_PASS',
    CONFIRM: 'CONFIRM'
}

class UserCode {
     constructor(data) {
    this.id = data.id;
    this.userId = data.completion_percentage;
    this.email = data.time_spent;
    this.code = data.watch_time;
    this.type = data.status;
    this.isActive = data.last_accessed_at;
    this.createAt = data.completed_at;
    this.expiryDateTime = data.created_at;
  }

   
 // Create new Code
  static async createOrUpdate(codeData) {
    const {
      userId, email, code, type, isActive, expiryDateTime
    } = codeData;

    const query = `
      INSERT INTO user_code (
        user_id, email, code, type, is_active, expiry_date_time, created_at 
      ) VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `;

    const result = await executeQuery(query, [userId, email, code, type, isActive, expiryDateTime]);
    return await User_code.findById(result.insertId);
  }


   // Find code by ID
  static async findById(id) {
    let query = 'SELECT * FROM user_code WHERE id = ?';

    const results = await executeQuery(query, [id]);
    
    if (results.length === 0) {
      return null;
    }

    const code = new User_code(results[0]);

    return code;
  }

  // Get all code with pagination and filters
  static async findAll(options = {}) {
    const {
      page = 1,
      limit = 10,
      search,
      userId
    } = options;

    let whereConditions = [];
    let params = [];

   

    if (userId) {
      whereConditions.push('c.user_id = ?');
      params.push(level);
    }

    if (search) {
      whereConditions.push('(c.code LIKE ? OR c.email LIKE ?)');
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm);
    }

  
    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    const baseQuery = `
      SELECT c.*
      FROM user_code c
      ${whereClause}
      ORDER BY c.create_at DESC
    `;

    const countQuery = `
      SELECT COUNT(DISTINCT c.id) as total 
      FROM user_code c 
      ${whereClause}
    `;

    const result = await getPaginatedResults(baseQuery, countQuery, params, page, limit);

    const codes = result.data.map(codeData => {
      const userCode = new User_code(codeData);
      userCode.userId = codeData.user_id;
      userCode.email = codeData.email;
      userCode.code = codeData.code;
      userCode.type = codeData.type;
      userCode.isActive = codeData.is_active === 1;
      userCode.expiryDateTime = codeData.expiry_date_time;
      userCode.createAt = codeData.created_at;
      return userCode;
    });

    return {
      codes,
      pagination: result.pagination
    };
  }

  // Update code
  static async update(id, updateData) {
    const allowedFields = [
        'user_id', 'email', 'code', 'type', 'is_active', 'expiry_date_time'
    ];

    const updateFields = [];
    const params = [];

    Object.keys(updateData).forEach(key => {
      const dbField = key.replace(/([A-Z])/g, '_$1').toLowerCase();
      if (allowedFields.includes(dbField)) {
        updateFields.push(`${dbField} = ?`);
        params.push(updateData[key]);
      }
    });

    if (updateFields.length === 0) {
      throw new Error('No valid fields to update');
    }


    params.push(id);

    const query = `
      UPDATE user_code 
      SET ${updateFields.join(', ')}, create_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;

    await executeQuery(query, params);
    return await User_code.findById(id);
  }

// Delete code
  static async delete(id) {
    const query = 'DELETE FROM user_code WHERE id = ?';
    const result = await executeQuery(query, [id]);
    return result.affectedRows > 0;
  }

  static  async consume ({ code }) {
        const query = 'CALL prc_consume_user_code(?);';
        const result = await executeQuery(query, [code]);
        
    return {idUser: result[0].idUser};
}

   

}

module.exports = UserCode;
