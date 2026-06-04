const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createTestUser() {
  try {
    const testEmail = "test@thecube.local";
    const testPassword = "TestPassword123!";

    console.log("Creating test user...");
    console.log(`Email: ${testEmail}`);
    console.log(`Password: ${testPassword}`);

    const { data, error } = await supabase.auth.admin.createUser({
      email: testEmail,
      password: testPassword,
      email_confirm: true,
      user_metadata: {
        name: "Test User",
      },
    });

    if (error) {
      console.error("Error creating user:", error);
      process.exit(1);
    }

    console.log("\n✅ Test user created successfully!");
    console.log(`User ID: ${data.user.id}`);
    console.log(`\nUse these credentials to log in:`);
    console.log(`Email: ${testEmail}`);
    console.log(`Password: ${testPassword}`);
  } catch (err) {
    console.error("Error:", err);
    process.exit(1);
  }
}

createTestUser();
