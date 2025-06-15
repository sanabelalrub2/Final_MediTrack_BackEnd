import admin from "firebase-admin";
import dotenv from 'dotenv'
dotenv.config()
// import serviceAccount  from "./ServiceAccount.json"  with {type:"json"};
const serviceAccount = {
  type: process.env.type,
  project_id: process.env.project_id,
  private_key_id: process.env.private_key,
  private_key: process.env.private_key.replace(/\\n/g, '\n') ,
  client_email: process.env.client_email,
  client_id:  process.env.client_id,
  auth_uri: process.env.auth_uri,
  token_uri:  process.token_uri,
  auth_provider_x509_cert_url:  process.env.auth_provider_x509_cert_url,
  client_x509_cert_url: process.env.client_x509_cert_url,
  universe_domain:  process.env.universe_domain
}
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});
export const fcm = admin.messaging();

