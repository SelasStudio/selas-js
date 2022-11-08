const selas_js = require("./dist/index.cjs");

const email = "your mail"
const password = "your password"

const test = async () => {
  const selas = selas_js.createBackendSelasClient();
  const { data: session } = await selas.signIn(email, password);

  const {data:job, error, message} = await selas.runStableDiffusion(
      "cute cat",
      512,
      512,
      50,
      7.5,
      "k_lms",
      1,
      "avif",
      model_name="TrinArt",
      worker_config = {
        "branch": "dreambooth-training",
        "is_dirty": false
      }
    );
  // const {data:job, error, message} = await selas.runClipInterrogate("https://storage.googleapis.com/selas-api/results/3eb82322-ea2e-457d-a778-f3360d2d8611.JPEG");
  // const {data:job, error, message} = await selas.getClipInterrogateResult(34259)
  console.log("message", message);
  console.log("job", job);
  console.log("error", error);


  // selas.getClipInterrogateResult(job.id)
  
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

