'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

const supabaseJs = require('@supabase/supabase-js');

class SelasClient {
  constructor(supabase, token) {
    this.postJob = async (config) => {
      const token = this.token;
      const { data, error } = await this.supabase.rpc("post_job", {
        config,
        token
      });
      const job = data;
      if (error) {
        return { error: error.message };
      } else {
        return {
          data: job
        };
      }
    };
    this.awaitResults = (job, timeout = 5e3) => new Promise((resolve, reject) => {
      const start = Date.now();
      const resultPile = [];
      if (!job.config.diffusion?.batch_size) {
        reject("No batch size specified in job config.");
      }
      const interval = setInterval(async () => {
        const { data: results, error } = await this.fetchResults(job.id);
        if (error) {
          clearInterval(interval);
          reject(error);
        } else {
          resultPile.push(...results);
          if (resultPile.length >= job.config.diffusion.batch_size) {
            clearInterval(interval);
            resolve(resultPile);
          } else if (Date.now() - start > timeout) {
            clearInterval(interval);
            reject("Timed out.");
          }
        }
      }, 250);
    });
    this.supabase = supabase;
    this.token = token;
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
  async runClipInterrogate(url) {
    const image = { url };
    const config = {
      clip_interrogate: {
        image
      }
    };
    return this.postJob(config);
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
  async runBlipCaption(url) {
    const image = { url };
    const config = {
      blip: {
        image
      }
    };
    return this.postJob(config);
  }
  async fetchResults(job_id) {
    const { data, error } = await this.supabase.from("results").select("*").eq("job_id", job_id);
    const results = data;
    if (error) {
      return { error: error.message };
    } else {
      return { data: results, message: `Results found.` };
    }
  }
  async generateImage({ prompt, format = "square", n_images = 1, quality = "normal", export_format = "avif", nsfw_filter = false }) {
    const diffusion = {
      prompts: [{ text: prompt }],
      width: format == "landscape" ? 768 : 512,
      height: format == "portrait" ? 768 : 512,
      steps: quality == "high" ? 50 : quality == "normal" ? 28 : 18,
      sampler: "k_euler",
      guidance_scale: 15,
      batch_size: n_images,
      image_format: export_format,
      nsfw_filter
    };
    const worker = {
      branch: "main",
      is_dirty: false
    };
    return await this.postJob({ diffusion, worker });
  }
}
const createSelasClient = (token_key) => {
  const SUPABASE_URL = "https://rmsiaqinsugszccqhnpj.supabase.co";
  const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJtc2lhcWluc3Vnc3pjY3FobnBqIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NjMxNDk1OTksImV4cCI6MTk3ODcyNTU5OX0.wp5GBiK4k4xQUJk_kdkW9a_mOt8C8x08pPgeTQErb9E";
  const supabase = supabaseJs.createClient(SUPABASE_URL, SUPABASE_KEY);
  return new SelasClient(supabase, token_key);
};

exports.SelasClient = SelasClient;
exports.createSelasClient = createSelasClient;
