const UserCode = require('../models/Codes');
const User = require('../models/User');
const CodeGenSvc = require('./randCodesGen');
const EmailSvc = require('../services/emailerService');
const { executeQuery } = require('../config/database');

class UserCodeService { 

    // Create new code
  static async createCode(codeData) {
    const validationErrors = this.validateCodeData(codeData);
    if (validationErrors.length > 0) {
      throw new Error(`Validation errors: ${validationErrors.join(', ')}`);
    }

    const code = await UserCode.create({
      ...codeData 
    });


    return await UserCode.findById(code.id);
  }

  // Get all codes with filters
  static async getAllCodes(options = {}) {
    const result = await UserCode.findAll(options);

    return result;
  }

   // Update course
  static async updateCode(codeId, updateData, userId) {
    const code = await UserCode.findById(codeId);
    if (!code) {
      throw new Error('code not found');
    }

 

    const validationErrors = this.validateCourseData(updateData, true);
    if (validationErrors.length > 0) {
      throw new Error(`Validation errors: ${validationErrors.join(', ')}`);
    }

    const updatedCode = await UserCode.update(codeId, updateData);


    return await UserCode.findById(codeId);
  }





    static async consume ({ code }) {
        return await UserCode.consume({ code });
}

   static async genActivationCode({ id, email }) {
     let {id:userId, firstName, lastName} = await User.findById(id);
   
    if(!userId) 
         throw new Error('user name not found');
       

    let code = codeGenSvc.generate();

    await this.addNew({
        userId: userId, code, 
        isActive: true,
        type: 'ACTIVATE',
        expiryDateTime: 
        new Date(Date.now() + (24 * 60 * 60 * 1000) ).toISOString()
    });
    
    EmailSvc.sendActivationCode(firstName, lastName, email, code);
}

    async genResetPasswordCode({email}) {
       
     const result =  await UserModel.create().findUser({email}); 
     
    if(!result) 
        throw {message: ERR_NOT_EXISTS_USER_NAME};
        
    let {idUser, firstName, lastName} = result;   
    let code = CodeGenSvc.generate();

    await this.addNew({
        code, 
        userId: idUser, 
        isActive: true,
        type: UserModel.Codes.CODES_TYPE.RESET_PASS,
        expiryDateTime: 
        new Date(Date.now() + userCodesConfig.resetPasswordCodeAge).toISOString()
    });
    
    EmailSvc.create().sendResetPasswordLink(firstName, lastName, email, code);
}

    async genConfirmationCode({email}) {

    let code = CodeGenSvc.generate(6, codeGenSvc.CODES_TYPES.NUMERIC);
    

    await this.addNew({
        code, 
        email, 
        isActive: true,
        type: UserModel.Codes.CODES_TYPE.CONFIRM,
        expiryDateTime: 
        new Date(Date.now() + userCodesConfig.confirmCodeAge).toISOString()
    });
    
    //if(validators.isEmail(email))
    EmailSvc.create().sendConfirmCode({code, email: email});   
}

    async delete({ idCode }) {
    await this.codeModel.delete({ idCode });
}

}


module.exports = UserCodeService;