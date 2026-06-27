import PocketBase from 'pocketbase';
const pb = new PocketBase('https://e-commerce-backend-73cc.onrender.com');
async function test() {
  try {
    await pb.admins.authWithPassword('admin@admin.com', '12345678');
    console.log('Success!');
  } catch (err) {
    console.log('Failed:', err.message);
  }
}
test();
