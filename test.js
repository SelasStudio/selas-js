const selas_js = require("./dist/index.cjs");

const email = ""
const password = ""

const test = async () => {
  const selas = selas_js.createBackendSelasClient();
  const { data: session } = await selas.signIn(email, password);

  const {data:job, error, message} = await selas.runStableDiffusion(
      "cute cat",
      512,
      512,
      50,
      15,
      "ddim",
      1,
      "avif",
      false,
      model_name="",
      worker_config = {
        "branch": "main",
        "is_dirty": true
      }
    );

  console.log(job, error, message);
  // const {data:job, error, message} = await selas.runClipInterrogate("https://storage.googleapis.com/selas-api/results/3eb82322-ea2e-457d-a778-f3360d2d8611.JPEG");
  // const {data:job, error, message} = await selas.getClipInterrogateResult(34259)

  // const instance_images =  [
  //   "https://media.discordapp.net/attachments/1034406505073623060/1035164223258513418/ezgif.com-gif-maker_7.jpg",
  //   "https://media.discordapp.net/attachments/1034406505073623060/1035164228094546000/ezgif.com-gif-maker_9.jpg",
  //   "https://media.discordapp.net/attachments/1034406505073623060/1035164228480409650/channels4_profile.jpg",
  //   "https://media.discordapp.net/attachments/1034406505073623060/1035164228706906142/2021022419331566637.png",
  //   "https://media.discordapp.net/attachments/1034406505073623060/1035164229088595968/31111280-8552969-image-a-44_1595516515505.jpg",
  //   "https://media.discordapp.net/attachments/1034406505073623060/1035164229319274496/maxresdefault.jpg",
  //   "https://media.discordapp.net/attachments/1034406505073623060/1035164229793239070/311715758_563877205737903_6505200442419112415_n.jpg",
  //   "https://media.discordapp.net/attachments/1034406505073623060/1035164230044885033/9ed7c6336ac0cd79097b1081aa102afd.jpg",
  // ]

  // const {data:job, error, message} = await selas.runDreambooth("a sks man", instance_images, "leo_urban_test_0", "first test on leo urban", "a man")
  // console.log("message", message);
  // console.log("job", job);
  // console.log("error", error);


  // selas.getClipInterrogateResult(job.id)
  
  // if (job) {
  //   await selas.subscribeToResults(job.id, (data) => {
  //     console.log("data", data);
  //   })
  // }
  // else {
  //   console.log("error", error);
  // }
}

test();

