'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

const supabaseJs = require('@supabase/supabase-js');

class SelasClient {
  constructor(supabase) {
    this.supabase = supabase;
  }
  async signIn(email, password) {
    return await this.supabase.auth.signInWithPassword({ email, password });
  }
  async getCustomer(external_id) {
    const { data, error } = await this.supabase.from("customers").select("*").eq("external_id", external_id);
    if (!data || error) {
      return { error: error.message, hint: `Customer ${external_id} unknown` };
    } else {
      return { data: data[0] };
    }
  }
  async createCustomer(external_id) {
    const { data, error } = await this.supabase.from("customers").insert({ external_id });
    if (error) {
      return { error: error.message, hint: `Customer ${external_id} already exists` };
    } else {
      const customer = data;
      return {
        data: customer,
        message: `Customer ${external_id} created.`
      };
    }
  }
  async deleteCustomer(external_id) {
    return this.supabase.from("customers").delete().eq("external_id", external_id);
  }
  async addCredits(external_id, credits) {
    const { data, error } = await this.supabase.rpc("provide_credits_to_customer", {
      p_external_id: external_id,
      p_nb_credits: credits
    });
    if (error) {
      return { error: error.message };
    } else {
      return {
        data: { current_balance: data },
        message: `Added ${credits} credits to customer ${external_id}. Current balance: ${data} credits`
      };
    }
  }
  async createToken(external_id, quota = 1, ttl = 60, description = "") {
    const { data, error } = await this.supabase.rpc("create_token", {
      target_external_id: external_id,
      target_quota: quota,
      target_ttl: ttl,
      target_description: description
    });
    if (error) {
      return { error: error.message };
    } else {
      const token = data;
      return {
        data: token,
        message: `Token created for customer ${external_id} with quota ${quota} and scope customer.`
      };
    }
  }
  async postJob(config, token_key) {
    const { data, error } = await this.supabase.rpc("post_job", {
      config,
      token_key
    });
    const job = data;
    if (error) {
      return { error: error.message };
    } else {
      return {
        data: job,
        message: `Job ${job.id} posted. Cost ${job.job_cost}.`
      };
    }
  }
  async getDreamboothResult(job_id) {
    const { data, error } = await this.supabase.from("dreambooth_results").select("*").eq("job_id", job_id);
    const results = data;
    if (error) {
      return { error: error.message };
    } else {
      return { data: results, message: `Results found.` };
    }
  }
  async runDreambooth(instance_prompt, instance_images, model_name, model_description, class_prompt, class_images, num_class_images, max_train_steps, num_train_epochs, learning_rate, train_text_encoder, with_prior_preservation, token_key) {
    let config = {
      dreambooth: {
        instance_prompt,
        instance_images: instance_images.map((url) => ({ url })),
        model_name
      }
    };
    if (model_description) {
      config.dreambooth.model_description = model_description;
    }
    if (class_prompt) {
      config.dreambooth.class_prompt = class_prompt;
    }
    if (class_images) {
      config.dreambooth.class_images = class_images.map((url) => ({ url }));
    }
    if (num_class_images) {
      config.dreambooth.num_class_images = num_class_images;
    }
    if (max_train_steps) {
      config.dreambooth.max_train_steps = max_train_steps;
    }
    if (num_train_epochs) {
      config.dreambooth.num_train_epochs = num_train_epochs;
    }
    if (learning_rate) {
      config.dreambooth.learning_rate = learning_rate;
    }
    if (train_text_encoder) {
      config.dreambooth.train_text_encoder = train_text_encoder;
    }
    if (with_prior_preservation) {
      config.dreambooth.with_prior_preservation = with_prior_preservation;
    }
    return this.postJob(config, token_key);
  }
  async getClipInterrogateResult(job_id) {
    const { data, error } = await this.supabase.from("clip_interrogate_results").select("*").eq("job_id", job_id);
    const results = data;
    if (error) {
      return { error: error.message };
    } else {
      return { data: results, message: `Results found.` };
    }
  }
  async runClipInterrogate(url, token_key) {
    const image = { url };
    const config = {
      clip_interrogate: {
        image
      }
    };
    return this.postJob(config, token_key);
  }
  async getBlipResult(job_id) {
    const { data, error } = await this.supabase.from("blip_results").select("*").eq("job_id", job_id);
    const results = data;
    if (error) {
      return { error: error.message };
    } else {
      return { data: results, message: `Results found.` };
    }
  }
  async runBlipCaption(url, token_key) {
    const image = { url };
    const config = {
      blip: {
        image
      }
    };
    return this.postJob(config, token_key);
  }
  async getResults(job_id) {
    const { data, error } = await this.supabase.from("results").select("*").eq("job_id", job_id);
    const results = data;
    if (error) {
      return { error: error.message };
    } else {
      return { data: results, message: `Results found.` };
    }
  }
  async subscribeToJob(job_id, callback) {
    this.supabase.channel(`public:jobs:id=eq.${job_id}`).on("postgres_changes", { event: "INSERT", schema: "public", table: "jobs", filter: `id=eq.${job_id}` }, callback).subscribe();
  }
  async subscribeToResults(job_id, callback) {
    this.supabase.channel(`public:results:job_id=eq.${job_id}`).on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "results", filter: `job_id=eq.${job_id}` },
      callback
    ).subscribe();
  }
  async runStableDiffusion(prompt, width = 512, height = 512, steps = 50, guidance_scale = 7.5, sampler = "k_lms", batch_size = 1, image_format = "avif", translate = false, diffusion_model = "1.5", worker_config, token_key) {
    const config = {
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
      worker: worker_config
    };
    return this.postJob(config, token_key);
  }
}
const createBackendSelasClient = () => {
  const SUPABASE_URL = "https://rmsiaqinsugszccqhnpj.supabase.co";
  const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJtc2lhcWluc3Vnc3pjY3FobnBqIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NjMxNDk1OTksImV4cCI6MTk3ODcyNTU5OX0.wp5GBiK4k4xQUJk_kdkW9a_mOt8C8x08pPgeTQErb9E";
  const supabase = supabaseJs.createClient(SUPABASE_URL, SUPABASE_KEY, { auth: { persistSession: false } });
  return new SelasClient(supabase);
};
const createSelasClient = (token_key) => {
  const SUPABASE_URL = "https://rmsiaqinsugszccqhnpj.supabase.co";
  const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJtc2lhcWluc3Vnc3pjY3FobnBqIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NjMxNDk1OTksImV4cCI6MTk3ODcyNTU5OX0.wp5GBiK4k4xQUJk_kdkW9a_mOt8C8x08pPgeTQErb9E";
  let options = {};
  if (token_key) {
    const jwt = "eyJhbGciOiJIUzI1NiJ9.eyJleHAiOjE5Nzg3MjU1OTksImlhdCI6MTY2MzE0OTU5OSwiaXNzIjoic3VwYWJhc2UiLCJyZWYiOiJybXNpYXFpbnN1Z3N6Y2NxaG5waiIsInJvbGUiOiJhbm9uIn0.wVaFy7iKbOeBtvYVZkLcJrytddUCBm_MtkB6oNTir2k";
    options = {
      global: {
        headers: {
          Authorization: `Bearer ${jwt}`
        }
      }
    };
  }
  const supabase = supabaseJs.createClient(SUPABASE_URL, SUPABASE_KEY, options);
  return new SelasClient(supabase);
};

exports.SelasClient = SelasClient;
exports.createBackendSelasClient = createBackendSelasClient;
exports.createSelasClient = createSelasClient;
