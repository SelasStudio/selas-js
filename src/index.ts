import { createClient, RealtimePostgresChangesPayload, SupabaseClient } from "@supabase/supabase-js";

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

export type Token = {
  id?: string;
  key: string;
  created_at?: string;
  user_id: string;
  ttl: number;
  quota: number;
  customer_id: string;
  description?: string;
};

export type Result = {
  id?: string;
  job_id: string;
  uri: string;
  created_at?: string;
  user_id: string;
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
  branch: string;
  is_dirty: boolean;
  name: string;
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
  io?: IOConfig;
  seed?: number;
  steps?: number;
  skip_steps?: number;
  batch_size?: number;
  nsfw_filter?: boolean;
  sampler: "plms" | "ddim" | "k_lms" | "k_euler" | "k_euler_a" | "k_euler" | "k_euler_a";
  guidance_scale?: number;
  width?: number;
  height?: number;
  prompts?: Prompt[];
  init_image?: InputImage;
  mask?: InputImage | Prompt;
  external_guidance?: any;
  diffusion_model?: string;
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

export type IOConfig = {
  image_format?: "png" | "jpg" | "avif" | "webp";
  image_quality?: number;
  blurhash?: boolean;
  translate?: boolean;
};

export type TextPrompt = {
  text?: string;
  weight?: number;
  concepts?: string[];
  cross_attention_editing?: string;
  cross_attention_weights?: string;
};

export type InputImage = {
  url: string;
  resize?: "crop" | "center_crop" | "scale";
};

export type ImagePrompt = {
  image?: InputImage;
  weight?: number;
  cutout_n?: number;
  perceptor?: "vit-l" | "vit-h" | "vit-b" | "vit-g";
};

export type Prompt = TextPrompt | ImagePrompt;

export class SelasClient {
  supabase: SupabaseClient;
  constructor(supabase: SupabaseClient) {
    this.supabase = supabase;
  }

  async signIn(email: string, password: string) {
    return await this.supabase.auth.signInWithPassword({ email, password });
  }

  async getCustomer(external_id: string) {
    const { data, error } = await this.supabase.from("customers").select("*").eq("external_id", external_id);

    if (!data || error) {
      return { error: error.message, hint: `Customer ${external_id} unknown` };
    } else {
      return { data: data[0] as Customer };
    }
  }

  async createCustomer(external_id: string) {
    const { data, error } = await this.supabase.from("customers").insert({ external_id });

    if (error) {
      return { error: error.message, hint: `Customer ${external_id} already exists` };
    } else {
      // @ts-ignore
      const customer = data as Customer;

      return {
        data: customer,
        message: `Customer ${external_id} created.`,
      };
    }
  }

  async deleteCustomer(external_id: string) {
    return this.supabase.from("customers").delete().eq("external_id", external_id);
  }

  async addCredits(external_id: string, credits: number) {
    const { data, error } = await this.supabase.rpc("provide_credits_to_customer", {
      p_external_id: external_id,
      p_nb_credits: credits,
    });

    if (error) {
      return { error: error.message };
    } else {
      return {
        data: { current_balance: data },
        message: `Added ${credits} credits to customer ${external_id}. Current balance: ${data} credits`,
      };
    }
  }

  async createToken(external_id: string, quota: number = 1, ttl: number = 60, description: string = "") {
    const { data, error } = await this.supabase.rpc("create_token", {
      target_external_id: external_id,
      target_quota: quota,
      target_ttl: ttl,
      target_description: description,
    });

    if (error) {
      return { error: error.message };
    } else {
      // @ts-ignore
      const token = data as Token;

      return {
        data: token,
        message: `Token created for customer ${external_id} with quota ${quota} and scope customer.`,
      };
    }
  }

  async postJob(config: Config, token_key?: string) {
    const { data, error } = await this.supabase.rpc("post_job", {
      config,
      token_key,
    });

    // @ts-ignore
    const job = data as Job;

    if (error) {
      return { error: error.message };
    } else {
      return {
        data: job,
        message: `Job ${job.id} posted. Cost ${job.job_cost}.`,
      };
    }
  }


  async getDreamboothResult(job_id: number) {
    const { data, error } = await this.supabase
      .from("dreambooth_results")
      .select("*")
      .eq("job_id", job_id);

    const results = data as DreamboothResult[];
    if (error) {
      return { error: error.message };
    } else {
      return { data: results, message: `Results found.` };
    }
  }

  /**
   * Perform a function call.
   *
   * @param model_name  The name of the model that you will use to perform the function call.
   * @param model_description  A description of the model that you will use to perform the function call.
   * @param class_prompt 
   * @param class_images
   * @param num_class_images 
   * @param learning_rate
   * @param train_text_encoder
   * @param with_prior_preservation
   * @param token_key
   *
   */
  async runDreambooth(instance_prompt: string, instance_images: string[],
    model_name: string, model_description?: string,
    class_prompt?: string, class_images?: string[],
    num_class_images?: number, max_train_steps?: number, num_train_epochs?: number,
    learning_rate?: number,
    train_text_encoder?: boolean,
    with_prior_preservation?: boolean,
    token_key?: string) {
    let config: Config = {
      dreambooth: {
        instance_prompt: instance_prompt,
        instance_images: instance_images.map((url) => ({ url })),
        model_name: model_name,
      },
    };
    
    // if optional parameters are provided, add them to the config
    if (model_description) {
      // @ts-ignore
      config.dreambooth.model_description = model_description;
    }
    if (class_prompt) {
      // @ts-ignore
      config.dreambooth.class_prompt = class_prompt;
    }
    if (class_images) {
      // @ts-ignore
      config.dreambooth.class_images = class_images.map((url) => ({ url }));
    }
    if (num_class_images) {
      // @ts-ignore
      config.dreambooth.num_class_images = num_class_images;
    }
    if (max_train_steps) {
      // @ts-ignore
      config.dreambooth.max_train_steps = max_train_steps;
    }
    if (num_train_epochs) {
      // @ts-ignore
      config.dreambooth.num_train_epochs = num_train_epochs;
    }
    if (learning_rate) {
      // @ts-ignore
      config.dreambooth.learning_rate = learning_rate;
    }
    if (train_text_encoder) {
      // @ts-ignore
      config.dreambooth.train_text_encoder = train_text_encoder;
    }
    if (with_prior_preservation) {
      // @ts-ignore
      config.dreambooth.with_prior_preservation = with_prior_preservation;
    }

    return this.postJob(config, token_key);
  }

  async getClipInterrogateResult(job_id: number) {
    const { data, error } = await this.supabase
      .from("clip_interrogate_results")
      .select("*")
      .eq("job_id", job_id);

    const results = data as ClipInterrogateResult[];
    if (error) {
      return { error: error.message };
    } else {
      return { data: results, message: `Results found.` };
    }
  }

  async runClipInterrogate(url: string, token_key?: string) {
    const image: InputImage = { url: url };
    const config: Config = {
      clip_interrogate: {
      image: image
      }
    };
    return this.postJob(config, token_key);
  }

  async getBlipResult(job_id: number) {
    const { data, error } = await this.supabase
      .from("blip_results")
      .select("*")
      .eq("job_id", job_id);

    const results = data as BlipResult[];
    if (error) {
      return { error: error.message };
    } else {
      return { data: results, message: `Results found.` };
    }
  }

  async runBlipCaption(url: string, token_key?: string) {
    const image: InputImage = { url: url };
    const config: Config = {
      blip: {
      image: image
      }
    };
    return this.postJob(config, token_key);
  }

  async getResults(job_id: number) {
    const { data, error } = await this.supabase.from("results").select("*").eq("job_id", job_id);

    // @ts-ignore
    const results = data as Result[];

    if (error) {
      return { error: error.message };
    } else {
      return { data: results, message: `Results found.` };
    }
  }
  // TODO: add the rest of the config options
  async subscribeToJob(job_id: number, callback: (payload: RealtimePostgresChangesPayload<Job>) => void) {
    this.supabase
      .channel(`public:jobs:id=eq.${job_id}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "jobs", filter: `id=eq.${job_id}` }, callback)
      .subscribe();
  }

  async subscribeToResults(job_id: number, callback: (payload: RealtimePostgresChangesPayload<Result>) => void) {
    this.supabase
      .channel(`public:results:job_id=eq.${job_id}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "results", filter: `job_id=eq.${job_id}` },
        callback
      )
      .subscribe();
  }

  async runStableDiffusion(
    prompt: string,
    width: 512 | 768  = 512,
    height: 512 | 768 = 512,
    steps: number = 50,
    guidance_scale: number=7.5,
    sampler: "plms" | "ddim" | "k_lms" | "k_euler" | "k_euler_a"="k_lms",
    batch_size: 1 | 2 | 3 | 4 = 1,
    image_format: "avif" | "jpg" | "png" | "webp" = "avif",
    translate: boolean = false,
    diffusion_model: string="1.5",
    worker_config?: WorkerConfig,
    token_key?: string
  ) {
    const config: Config = {
      diffusion: {
        prompts: [{ text: prompt }],
        width,
        height,
        steps,
        sampler,
        guidance_scale,
        batch_size,
        io: {
          image_format,
          image_quality: 100,
          blurhash: false,
          translate
        },
        diffusion_model
      },
      worker: worker_config,
    };

    return this.postJob(config, token_key);
  }
}


type Model = {
  id: string;
  type: "vae" | "unet" | "text_encoder"
  parent_model_id: string;
  name: string;
  description: string;
  version: string;
  runtime: "pytorch" | "ait";
  ait_config?: {
    gpu: string;
    batch_size: number;
    width: number;
    height: number;
  }
  data: string;
}

type LDM = {
  id: string;
  name: string;
  description: string;
  dreambooth_trigger?: string;
  user_id?: string;
  load_priority?: number;
  created_at: string;
  last_used_at: string;
  text_encoder: Model,
  unet: Model,
  vae: Model,
}

export const createBackendSelasClient = () => {
  const SUPABASE_URL = "https://rmsiaqinsugszccqhnpj.supabase.co";
  const SUPABASE_KEY =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJtc2lhcWluc3Vnc3pjY3FobnBqIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NjMxNDk1OTksImV4cCI6MTk3ODcyNTU5OX0.wp5GBiK4k4xQUJk_kdkW9a_mOt8C8x08pPgeTQErb9E";

  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, { auth: { persistSession: false } });
  return new SelasClient(supabase);
};

export const createSelasClient = (token_key?: string) => {
  const SUPABASE_URL = "https://rmsiaqinsugszccqhnpj.supabase.co";
  const SUPABASE_KEY =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJtc2lhcWluc3Vnc3pjY3FobnBqIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NjMxNDk1OTksImV4cCI6MTk3ODcyNTU5OX0.wp5GBiK4k4xQUJk_kdkW9a_mOt8C8x08pPgeTQErb9E";

  let options = {};

  if (token_key) {
    const jwt =
      "eyJhbGciOiJIUzI1NiJ9.eyJleHAiOjE5Nzg3MjU1OTksImlhdCI6MTY2MzE0OTU5OSwiaXNzIjoic3VwYWJhc2UiLCJyZWYiOiJybXNpYXFpbnN1Z3N6Y2NxaG5waiIsInJvbGUiOiJhbm9uIn0.wVaFy7iKbOeBtvYVZkLcJrytddUCBm_MtkB6oNTir2k";

    options = {
      global: {
        headers: {
          Authorization: `Bearer ${jwt}`,
        },
      },
    };
  }
  // const payload = { exp: 1978725599, iat: 1663149599, iss: "supabase", ref: "rmsiaqinsugszccqhnpj", role: "anon" }

  // const jwt_token = await new SignJWT(payload).setProtectedHeader({ alg: "HS256" }).sign(new TextEncoder().encode(SUPABASE_KEY));

  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, options);

  return new SelasClient(supabase);
};
