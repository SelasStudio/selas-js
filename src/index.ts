import { createClient, SupabaseClient } from "@supabase/supabase-js";

export type Customer = {
  id?: string;
  external_id: string;
  user_id: string;
  credits: number;
};

export type Billing = {
  id?: string;
  stripe_customer_id?: string;
  plan?: string;
  plan_name?: string;
  credits: number;
};

export type Result = {
  image: string;
};

export type BlipResult = {
  id?: string;
  job_id: string;
  caption: string;
  created_at?: string;
  user_id: string;
};

export type TextRank = {
  text: string;
  confidence: number;
};

export type ClipInterrogation = {
  medium: TextRank[];
  artist: TextRank[];
  trending: TextRank[];
  movement: TextRank[];
  flavors: TextRank[];
  techniques: TextRank[];
  tags: TextRank[];
};

export type ClipInterrogateResult = {
  id?: string;
  job_id: string;
  interrogation: ClipInterrogation;
  created_at?: string;
  user_id: string;
};

export type DreamboothResult = {
  id?: string;
  job_id: string;
  user_id: string;
  diffusion_model_id: string;
  created_at?: string;
};

export type WorkerConfig = {
  branch?: string;
  is_dirty?: boolean;
  name?: string;
  cluster?: string;
  commit?: string;
  tags?: string[];
  services?: string[];
};

export type Job = {
  id?: number;
  created_at?: string;
  status?: "pending" | "accepted" | "completed" | "failed";
  user_id?: string;
  accepted_at?: string;
  completed_at?: string;
  failed_at?: string;
  worker_name?: string;
  token_key?: string;
  config: Config;
  job_cost?: number;
  worker_config?: WorkerConfig;
};

export type Config = {
  diffusion?: DiffusionConfig;
  blip?: BlipConfig;
  clip_interrogate?: ClipInterrogateConfig;
  dreambooth?: DreamboothConfig;
  worker?: WorkerConfig;
};

export type DiffusionConfig = {
  seed?: number;
  steps: number;
  skip_steps: number;
  batch_size: 1 | 2 | 4 | 8 | 16;
  sampler: "plms" | "ddim" | "k_lms" | "k_euler" | "k_euler_a";
  guidance_scale: number;
  width: 384 | 448 | 512 | 575 | 768 | 640 | 704 | 768;
  height: 384 | 448 | 512 | 575 | 768 | 640 | 704 | 768;
  prompts: Prompt[];
  init_image?: InputImage;
  mask?: InputImage | Prompt;
  external_guidance?: any;
  image_format: "png" | "jpg" | "avif" | "webp";
  translate: boolean;
  nsfw_filter: boolean;
};

export type DreamboothConfig = {
  instance_prompt: string;
  instance_images: InputImage[];
  model_name: string;
  model_description?: string;
  class_prompt?: string;
  class_images?: InputImage[];
  pretrained_model_name_or_path?: string;
  num_class_images?: number;
  max_train_steps?: number;
  num_train_epochs?: number;
  resolution?: number;
  learning_rate?: number;
  lr_scheduler?: string;
  lr_warmup_steps?: number;
  scale_lr?: boolean;
  gradient_accumulation_steps?: number;
  gradient_checkpointing?: boolean;
  train_text_encoder?: boolean;
  with_prior_preservation?: boolean;
  prior_loss_weight?: number;
  sample_batch_size?: number;
  train_batch_size?: number;
  mixed_precision?: string;
  use_8bit_adam?: boolean;
  adam_beta1?: number;
  adam_beta2?: number;
  adam_weight_decay?: number;
  adam_epsilon?: number;
  seed?: number;
  center_crop?: boolean;
  max_grad_norm?: number;
  revision?: string;
  tokenizer_name?: string;
};

export type BlipConfig = {
  image?: InputImage;
};

export type ClipInterrogateConfig = {
  image?: InputImage;
};

export type TextPrompt = {
  text: string;
  weight: number;
  cross_attention_editing?: string;
  cross_attention_weights?: string;
};

export type InputImage = {
  url: string;
  resize?: "crop" | "center_crop" | "scale";
};

export type ImagePrompt = {
  image: InputImage;
  weight: number;
  cutout_n?: number;
  perceptor?: "vit-l" | "vit-h" | "vit-b" | "vit-g";
};

export type Prompt = TextPrompt | ImagePrompt;

export class SelasClient {
  supabase: SupabaseClient;
  token: string | undefined;

  constructor(supabase: SupabaseClient, token: string) {
    this.supabase = supabase;
    this.token = token;
  }

  postJob = async (config: Config) => {
    const token = this.token;
    const { data, error } = await this.supabase.rpc("post_job", {
      config,
      token,
    });

    // @ts-ignore
    const job = data as Job;

    if (error) {
      return { error: error.message };
    } else {
      return {
        data: job,
      };
    }
  };

  async getClipInterrogateResult(job_id: number) {
    const { data, error } = await this.supabase.from("clip_interrogate_results").select("*").eq("job_id", job_id);

    const results = data as ClipInterrogateResult[];
    if (error) {
      return { error: error.message };
    } else {
      return { data: results, message: `Results found.` };
    }
  }

  async runClipInterrogate(url: string) {
    const image: InputImage = { url: url };
    const config: Config = {
      clip_interrogate: {
        image: image,
      },
    };
    return this.postJob(config);
  }

  async getBlipResult(job_id: number) {
    const { data, error } = await this.supabase.from("blip_results").select("*").eq("job_id", job_id);

    const results = data as BlipResult[];
    if (error) {
      return { error: error.message };
    } else {
      return { data: results, message: `Results found.` };
    }
  }

  async runBlipCaption(url: string) {
    const image: InputImage = { url: url };
    const config: Config = {
      blip: {
        image: image,
      },
    };
    return this.postJob(config);
  }

  async fetchResults(job_id: number) {
    const { data, error } = await this.supabase.from("results").select("*").eq("job_id", job_id);

    // @ts-ignore
    const results = data as Result[];

    if (error) {
      return { error: error.message };
    } else {
      return { data: results, message: `Results found.` };
    }
  }

  awaitResults = (job: Job, timeout: number = 5000) =>
    new Promise((resolve, reject) => {
      const start = Date.now();
      const resultPile: Result[] = [];

      if (!job.config.diffusion?.batch_size) {
        reject("No batch size specified in job config.");
      }

      const interval = setInterval(async () => {
        const { data: results, error } = await this.fetchResults(job.id!);
        if (error) {
          clearInterval(interval);
          reject(error);
        } else {
          resultPile.push(...results!);
          if (resultPile.length >= job.config.diffusion!.batch_size!) {
            clearInterval(interval);
            resolve(resultPile);
          } else if (Date.now() - start > timeout) {
            clearInterval(interval);
            reject("Timed out.");
          }
        }
      }, 250);
    });

  async generateImage({
    prompt,
    format = "square",
    n_images = 1,
    quality = "normal",
    export_format = "avif",
    nsfw_filter = false,
  }: generateImageParams) {
    const diffusion: DiffusionConfig = {
      prompts: [{ text: prompt }],
      width: format == "landscape" ? 768 : 512,
      height: format == "portrait" ? 768 : 512,
      steps: quality == "high" ? 50 : quality == "normal" ? 28 : 18,
      sampler: "k_euler",
      guidance_scale: 15,
      batch_size: n_images,
      image_format: export_format,
      nsfw_filter,
    };

    const worker: WorkerConfig = {
      branch: "main",
      is_dirty: false,
    };

    return await this.postJob({ diffusion, worker });
  }
}

type generateImageParams = {
  prompt: string;
  format: "landscape" | "portrait" | "square";
  n_images: 1 | 4;
  quality: "minimal" | "normal" | "high";
  export_format: "png" | "jpg" | "webp" | "avif";
  nsfw_filter: boolean;
};

export const createSelasClient = (token_key: string) => {
  const SUPABASE_URL = "https://rmsiaqinsugszccqhnpj.supabase.co";
  const SUPABASE_KEY =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJtc2lhcWluc3Vnc3pjY3FobnBqIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NjMxNDk1OTksImV4cCI6MTk3ODcyNTU5OX0.wp5GBiK4k4xQUJk_kdkW9a_mOt8C8x08pPgeTQErb9E";

  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

  return new SelasClient(supabase, token_key);
};
