'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

const supabaseJs = require('@supabase/supabase-js');

class SelasClient {
  constructor(supabase) {
    this.supabase = supabase;
  }
  async signIn(email, password) {
    await this.supabase.auth.signInWithPassword({ email, password });
  }
  async getCustomer(external_id) {
    const { data, error } = await this.supabase.from("customers").select("*").eq("external_id", external_id);
    if (error) {
      return { error: `Customer ${external_id} unknown` };
    } else {
      return { data: data[0] };
    }
  }
  async createCustomer(external_id) {
    const { data, error } = await this.supabase.from("customers").insert({ external_id });
    if (error) {
      return { error: `Customer ${external_id} already exists` };
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
    const { data, error } = await this.supabase.rpc(
      "provide_credits_to_customer",
      {
        p_external_id: external_id,
        p_nb_credits: credits
      }
    );
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
  async getResults(job_id) {
    const { data, error } = await this.supabase.from("results").select("*").eq("job_id", job_id);
    const results = data;
    if (error) {
      return { error: error.message };
    } else {
      return { data: results, message: `Results found.` };
    }
  }
  async runStableDiffusion(prompt, width, height, steps, guidance_scale, token_key) {
    const config = {
      diffusion: {
        prompts: [{ text: prompt }],
        width,
        height,
        steps,
        sampler: "k_lms",
        guidance_scale,
        io: {
          image_format: "avif",
          image_quality: 100,
          blurhash: false
        }
      }
    };
    return this.postJob(config, token_key);
  }
}
const createSelasClient = () => {
  const SUPABASE_URL = "https://rmsiaqinsugszccqhnpj.supabase.co";
  const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJtc2lhcWluc3Vnc3pjY3FobnBqIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NjMxNDk1OTksImV4cCI6MTk3ODcyNTU5OX0.wp5GBiK4k4xQUJk_kdkW9a_mOt8C8x08pPgeTQErb9E";
  const supabase = supabaseJs.createClient(SUPABASE_URL, SUPABASE_KEY);
  return new SelasClient(supabase);
};

exports.SelasClient = SelasClient;
exports.createSelasClient = createSelasClient;
