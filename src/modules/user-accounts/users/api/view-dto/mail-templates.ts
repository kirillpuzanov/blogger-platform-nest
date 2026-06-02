export class MailTemplates {
  static registrationTemplate(code: string): string {
    return `
        <h1>Thank for your registration</h1>
        <p>To finish registration please follow the link below:
             <a href='https://somesite.com/confirm-email?code=${code}'>complete registration</a>
        </p>
    `;
  }

  static recoveryPassTemplate(code: string): string {
    return `
      <h1>Password recovery</h1>
       <p>To finish password recovery please follow the link below:
          <a href='https://somesite.com/password-recovery?recoveryCode=${code}'>recovery password</a>
      </p>
    `;
  }
}
