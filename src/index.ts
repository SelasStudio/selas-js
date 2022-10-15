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
};

export type DiffusionConfig = {
  io?: IOConfig;
  seed?: number;
  steps?: number;
  skip_steps?: number;
  batch_size?: number;
  sampler?: "plms" | "ddim" | "k_lms" | "k_euler" | "k_euler_a";
  guidance_scale?: number;
  width?: number;
  height?: number;
  prompts?: Prompt[];
  init_image?: InputImage;
  mask?: InputImage | Prompt;
  external_guidance?: any;
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
