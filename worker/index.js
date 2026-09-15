const json=(data,status=200,headers={})=>new Response(JSON.stringify(data),{status,headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store',...headers}});
const cors=(h={})=>({...h,'access-control-allow-origin':'same-origin','x-content-type-options':'nosniff'});
const id=()=>crypto.randomUUID();
const now=()=>new Date().toISOString();

async function accessToken(env){
  const r=await fetch('https://oauth2.googleapis.com/token',{method:'POST',headers:{'content-type':'application/x-www-form-urlencoded'},body:new URLSearchParams({client_id:env.GOOGLE_CLIENT_ID,client_secret:env.GOOGLE_CLIENT_SECRET,refresh_token:env.GOOGLE_REFRESH_TOKEN,grant_type:'refresh_token'})});
  if(!r.ok) throw new Error('Google OAuth token refresh failed');
  return (await r.json()).access_token;
}
async function driveUpload(env,file){
  const token=await accessToken(env);
  const meta={name:file.name,parents:[env.DRIVE_FOLDER_ID],description:'Security Vision gallery media'};
  const boundary='sv_'+crypto.randomUUID().replaceAll('-','');
  const head=`--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(meta)}\r\n--${boundary}\r\nContent-Type: ${file.type||'application/octet-stream'}\r\n\r\n`;
  const tail=`\r\n--${boundary}--`;
  const bytes=new Uint8Array(await file.arrayBuffer());
  const body=new Uint8Array(new TextEncoder().encode(head).length+bytes.length+new TextEncoder().encode(tail).length);
  let p=0; const a=new TextEncoder().encode(head), b=new TextEncoder().encode(tail); body.set(a,p);p+=a.length;body.set(bytes,p);p+=bytes.length;body.set(b,p);
  const r=await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,mimeType,size,webContentLink,webViewLink',{method:'POST',headers:{Authorization:`Bearer ${token}`,'Content-Type':`multipart/related; boundary=${boundary}`},body});
  if(!r.ok) throw new Error('Google Drive upload failed');
  const out=await r.json();
  await fetch(`https://www.googleapis.com/drive/v3/files/${out.id}/permissions`,{method:'POST',headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json'},body:JSON.stringify({role:'reader',type:'anyone'})});
  return out;
}
async function requireAuth(request,env){
  const cookie=request.headers.get('Cookie')||''; const m=cookie.match(/sv_session=([^;]+)/); if(!m) return null;
  const row=await env.DB.prepare('SELECT * FROM sessions WHERE id=? AND expires_at>?').bind(m[1],Date.now()).first();
  return row||null;
}
async function publicData(env){
  const media=await env.DB.prepare('SELECT id,name,mime_type,public_url,alt,caption,category,frame_type,position,focus_x,focus_y,zoom,radius,sort_order FROM media WHERE published=1 ORDER BY sort_order ASC,created_at DESC').all();
  const settings=await env.DB.prepare('SELECT key,value FROM settings').all();
  return {media:media.results||[],settings:Object.fromEntries((settings.results||[]).map(x=>[x.key,JSON.parse(x.value)]))};
}

export default {async fetch(request,env){
  const url=new URL(request.url); const path=url.pathname;
  try{
    if(request.method==='GET'&&path==='/api/site') return json(await publicData(env),200,cors());
    if(request.method==='POST'&&path==='/api/bookings'){
      const x=await request.json(); if(!x.name||!x.phone) return json({error:'Name and phone are required'},400,cors());
      const b={id:id(),name:String(x.name).slice(0,100),phone:String(x.phone).slice(0,40),service:String(x.service||'').slice(0,100),preferred_date:String(x.date||'').slice(0,20),message:String(x.message||'').slice(0,1000),status:'pending',created_at:now()};
      await env.DB.prepare('INSERT INTO bookings(id,name,phone,service,preferred_date,message,status,created_at) VALUES(?,?,?,?,?,?,?,?)').bind(...Object.values(b)).run(); return json({ok:true,id:b.id},201,cors());
    }
    if(path.startsWith('/api/admin/')){
      const session=await requireAuth(request,env);
      if(!session && path!=='/api/admin/auth/google') return json({error:'Unauthorized'},401,cors());
      if(path==='/api/admin/auth/google'&&request.method==='GET'){
        const state=id(); const u=new URL('https://accounts.google.com/o/oauth2/v2/auth'); u.searchParams.set('client_id',env.GOOGLE_CLIENT_ID);u.searchParams.set('redirect_uri',`${env.PUBLIC_ORIGIN}/api/admin/auth/callback`);u.searchParams.set('response_type','code');u.searchParams.set('scope','openid email');u.searchParams.set('state',state);u.searchParams.set('access_type','offline'); return Response.redirect(u.toString(),302);
      }
      if(path==='/api/admin/auth/callback'&&request.method==='GET'){
        const code=url.searchParams.get('code'); if(!code)return json({error:'Missing OAuth code'},400,cors());
        const r=await fetch('https://oauth2.googleapis.com/token',{method:'POST',headers:{'content-type':'application/x-www-form-urlencoded'},body:new URLSearchParams({client_id:env.GOOGLE_CLIENT_ID,client_secret:env.GOOGLE_CLIENT_SECRET,code,grant_type:'authorization_code',redirect_uri:`${env.PUBLIC_ORIGIN}/api/admin/auth/callback`})}); if(!r.ok)return json({error:'OAuth exchange failed'},401,cors()); const tok=await r.json(); const me=await fetch('https://openidconnect.googleapis.com/v1/userinfo',{headers:{Authorization:`Bearer ${tok.access_token}`}}); const profile=await me.json(); if(!profile.email||profile.email.toLowerCase()!==env.ADMIN_GOOGLE_EMAIL.toLowerCase())return new Response('Not authorized',403);
        const sid=id(); await env.DB.prepare('INSERT INTO sessions(id,email,expires_at,created_at) VALUES(?,?,?,?)').bind(sid,profile.email,Date.now()+1000*60*60*12,Date.now()).run(); return new Response('',{status:302,headers:{Location:`${env.PUBLIC_ORIGIN}/sv-control-7f3a9d/`, 'Set-Cookie':`sv_session=${sid}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=43200`}});
      }
      if(path==='/api/admin/logout'&&request.method==='POST'){const c=request.headers.get('Cookie')||'';const m=c.match(/sv_session=([^;]+)/);if(m)await env.DB.prepare('DELETE FROM sessions WHERE id=?').bind(m[1]).run();return new Response('',{status:204,headers:{'Set-Cookie':'sv_session=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0'}})}
      if(path==='/api/admin/media'&&request.method==='GET') return json(await env.DB.prepare('SELECT * FROM media ORDER BY sort_order ASC,created_at DESC').all(),200,cors());
      if(path==='/api/admin/media'&&request.method==='POST'){
        const form=await request.formData(); const file=form.get('file'); if(!(file instanceof File))return json({error:'file required'},400,cors()); if(file.size>25*1024*1024)return json({error:'File too large (25MB max)'},413,cors()); if(!/^image\/(jpeg|png|webp|gif)|^video\/(mp4|webm|quicktime)$/.test(file.type))return json({error:'Unsupported media type'},415,cors()); const d=await driveUpload(env,file); const item={id:id(),drive_file_id:d.id,name:file.name,mime_type:file.type,size:file.size,public_url:`https://drive.google.com/uc?id=${d.id}&export=view`,alt:String(form.get('alt')||file.name).slice(0,200),caption:String(form.get('caption')||'').slice(0,500),category:String(form.get('category')||'gallery').slice(0,50),created_at:now()}; await env.DB.prepare('INSERT INTO media(id,drive_file_id,name,mime_type,size,public_url,alt,caption,category,created_at) VALUES(?,?,?,?,?,?,?,?,?,?)').bind(...Object.values(item)).run(); return json(item,201,cors());
      }
      const fm=path.match(/^\/api\/admin\/media\/([^/]+)\/frame$/); if(fm&&request.method==='PATCH'){const x=await request.json();await env.DB.prepare('UPDATE media SET frame_type=?,position=?,focus_x=?,focus_y=?,zoom=?,radius=? WHERE id=?').bind(String(x.frame_type||'cover'),String(x.position||'center'),Number(x.focus_x||50),Number(x.focus_y||50),Number(x.zoom||1),Number(x.radius||18),fm[1]).run();return json({ok:true},200,cors());}
      const pub=path.match(/^\/api\/admin\/media\/([^/]+)\/publish$/);if(pub&&request.method==='POST'){const x=await request.json();await env.DB.prepare('UPDATE media SET published=? WHERE id=?').bind(x.published?1:0,pub[1]).run();return json({ok:true},200,cors());}
      if(path==='/api/admin/bookings'&&request.method==='GET')return json(await env.DB.prepare('SELECT * FROM bookings ORDER BY created_at DESC').all(),200,cors());
      if(path==='/api/admin/content'&&(request.method==='GET'||request.method==='PUT')){if(request.method==='GET')return json(await env.DB.prepare("SELECT key,value FROM settings WHERE key='content'").first(),200,cors());const x=await request.json();await env.DB.prepare('INSERT INTO settings(key,value) VALUES(?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value').bind('content',JSON.stringify(x)).run();return json({ok:true},200,cors());}
      if(path==='/api/admin/social'&&(request.method==='GET'||request.method==='PUT')){if(request.method==='GET')return json(await env.DB.prepare("SELECT key,value FROM settings WHERE key='social'").first(),200,cors());const x=await request.json();await env.DB.prepare('INSERT INTO settings(key,value) VALUES(?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value').bind('social',JSON.stringify(x)).run();return json({ok:true},200,cors());}
      if(path==='/api/admin/me'&&request.method==='GET')return json({email:session.email},200,cors());
    }
    return env.ASSETS.fetch(request);
  }catch(e){return json({error:e.message||'Server error'},500,cors())}
}};
