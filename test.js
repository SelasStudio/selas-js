const selas_js = require("./dist/index.cjs");

const email = "your mail"
const password = "your password"

const test = async () => {
  const selas = selas_js.createSelasClient();
  const { data: session } = await selas.signIn(email, password);

  const {data:job, error} = await selas.runStableDiffusion(
      "A magic mushroom",
      512,
      512,
      50,
      7.5,
      "k_lms",
      1,
      "avif"
    );
  
  if (job) {
    await selas.subscribeToResults(job.id, (data) => {
      console.log("data", data);
    })
  }
  else {
    console.log("error", error);
  }
}

test();
