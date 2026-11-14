// Configure the web OAuth client from the standard Cloud project shared with Apps Script.
const posConnection = {
  clientId: '392222493837-ld17jjj2r3afr23ehr8hmvaibgtc7e92.apps.googleusercontent.com',
  deploymentId: 'AKfycbyoAa6II2t9iGUnJtZ8WjhrGgnqomYo9Uvzr95G3h8JK6xikSefS2iy0rcWltEdUQ',
  scopes: 'https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/userinfo.email'
};
let posAccessToken = '';
let posExpiresAt = 0;
function authorizePos(email){
  if(!posConnection.clientId || !posConnection.scopes)
    return Promise.reject(Error('รุ่นทดสอบยังรอการเชื่อมบัญชี Google'));
  if(!window.google?.accounts?.oauth2)
    return Promise.reject(Error('ยังโหลดบริการเข้าสู่ระบบ Google ไม่สำเร็จ กรุณาลองอีกครั้ง'));
  return new Promise((resolve,reject)=>{
    const client=google.accounts.oauth2.initTokenClient({
      client_id:posConnection.clientId,scope:posConnection.scopes,login_hint:email,
      callback:result=>{
        if(result.error || !result.access_token){reject(Error('เข้าใช้งานด้วยบัญชี Google ไม่สำเร็จ'));return}
        posAccessToken=result.access_token;
        posExpiresAt=Date.now()+Number(result.expires_in)*1000;
        resolve();
      },
      error_callback:()=>reject(Error('กรุณาเปิดหน้าต่าง Google เพื่อยืนยันบัญชี'))
    });
    client.requestAccessToken({prompt:''});
  });
}
async function call(name,...args){
  if(!posAccessToken || Date.now()>=posExpiresAt)throw Error('กรุณายืนยันบัญชี Google อีกครั้ง');
  const response=await fetch('https://script.googleapis.com/v1/scripts/'+posConnection.deploymentId+':run',{
    method:'POST',headers:{Authorization:'Bearer '+posAccessToken,'Content-Type':'application/json'},
    body:JSON.stringify({function:name,parameters:args})
  });
  const body=await response.json();
  if(!response.ok || body.error)throw Error(body.error?.details?.[0]?.errorMessage || body.error?.message || 'ติดต่อระบบสาขาไม่สำเร็จ');
  return body.response?.result;
}
