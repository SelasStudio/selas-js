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
};

export type Config = {
  diffusion?: DiffusionConfig;
  blip?: BlipConfig;
  clip_interrogate?: ClipInterrogateConfig;
  dreambooth?: DreamboothConfig;
};

export type DiffusionConfig = {
  io?: IOConfig;
  seed?: number;
  steps?: number;
  skip_steps?: number;
  batch_size?: number;
  nsfw_filter?: boolean;
  sampler?: "plms" | "ddim" | "k_lms" | "k_euler" | "k_euler_a";
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
    await this.supabase.auth.signIn({ email, password });
  }

  async getCustomer(external_id: string) {
    const { data, error } = await this.supabase
      .from("customers")
      .select("*")
      .eq("external_id", external_id);

    if (error) {
      return { error: `Customer ${external_id} unknown` };
    } else {
      return { data: data[0] as Customer };
    }
  }

  async createCustomer(external_id: string) {
    const { data, error } = await this.supabase
      .from("customers")
      .insert({ external_id });

    if (error) {
      return { error: `Customer ${external_id} already exists` };
    } else {
      return {
        data: data[0] as Customer,
        message: `Customer ${external_id} created.`,
      };
    }
  }

  async deleteCustomer(external_id: string) {
    return this.supabase
      .from("customers")
      .delete()
      .eq("external_id", external_id);
  }

  async addCredits(external_id: string, credits: number) {
    const { data, error } = await this.supabase.rpc(
      "provide_credits_to_customer",
      {
        p_external_id: external_id,
        p_nb_credits: credits,
      }
    );

    if (error) {
      return { error: error.message };
    } else {
      return {
        data: { current_balance: data },
        message: `Added ${credits} credits to customer ${external_id}. Current balance: ${data} credits`,
      };
    }
  }

  async createToken(
    external_id: string,
    quota: number = 1,
    ttl: number = 60,
    description: string = ""
  ) {
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
    const { data, error } = await this.supabase
      .from("results")
      .select("*")
      .eq("job_id", job_id);

    // @ts-ignore
    const results = data as Result[];

    if (error) {
      return { error: error.message };
    } else {
      return { data: results, message: `Results found.` };
    }
  }
  // TODO: add the rest of the config options
  async runStableDiffusion(
    prompt: string,
    width: number,
    height: number,
    steps: number,
    guidance_scale: 7.5,
    token_key?: string
  ) {
    const config: Config = {
      diffusion: {
        prompts: [{ text: prompt }],
        width,
        height,
        steps,
        sampler: "k_lms",
        guidance_scale: guidance_scale,
        io: {
          image_format: "avif",
          image_quality: 100,
          blurhash: false,
        },
      },
    };

    return this.postJob(config, token_key);
  }
}

export const createSelasClient = () => {
  const SUPABASE_URL = "https://rmsiaqinsugszccqhnpj.supabase.co";
  const SUPABASE_KEY =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJtc2lhcWluc3Vnc3pjY3FobnBqIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NjMxNDk1OTksImV4cCI6MTk3ODcyNTU5OX0.wp5GBiK4k4xQUJk_kdkW9a_mOt8C8x08pPgeTQErb9E";

  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
  return new SelasClient(supabase);
};
