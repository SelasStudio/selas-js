import * as _supabase_supabase_js from '@supabase/supabase-js';
import { SupabaseClient, RealtimePostgresChangesPayload } from '@supabase/supabase-js';

declare type Customer = {
    id?: string;
    external_id: string;
    user_id: string;
    credits: number;
};
declare type Billing = {
    id?: string;
    stripe_customer_id?: string;
    plan?: string;
    plan_name?: string;
    credits: number;
};
declare type Token = {
    id?: string;
    key: string;
    created_at?: string;
    user_id: string;
    ttl: number;
    quota: number;
    customer_id: string;
    description?: string;
};
declare type Result = {
    id?: string;
    job_id: string;
    uri: string;
    created_at?: string;
    user_id: string;
};
declare type BlipResult = {
    id?: string;
    job_id: string;
    caption: string;
    created_at?: string;
    user_id: string;
};
declare type TextRank = {
    text: string;
    confidence: number;
};
declare type ClipInterrogation = {
    medium: TextRank[];
    artist: TextRank[];
    trending: TextRank[];
    movement: TextRank[];
    flavors: TextRank[];
    techniques: TextRank[];
    tags: TextRank[];
};
declare type ClipInterrogateResult = {
    id?: string;
    job_id: string;
    interrogation: ClipInterrogation;
    created_at?: string;
    user_id: string;
};
declare type DreamboothResult = {
    id?: string;
    job_id: string;
    user_id: string;
    diffusion_model_id: string;
    created_at?: string;
};
declare type WorkerConfig = {
    branch: string;
    is_dirty: boolean;
};
declare type Job = {
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
declare type Config = {
    diffusion?: DiffusionConfig;
    blip?: BlipConfig;
    clip_interrogate?: ClipInterrogateConfig;
    dreambooth?: DreamboothConfig;
    worker?: WorkerConfig;
};
declare type DiffusionConfig = {
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
declare type DreamboothConfig = {
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
declare type BlipConfig = {
    image?: InputImage;
};
declare type ClipInterrogateConfig = {
    image?: InputImage;
};
declare type IOConfig = {
    image_format?: "png" | "jpg" | "avif" | "webp";
    image_quality?: number;
    blurhash?: boolean;
    translate?: boolean;
};
declare type TextPrompt = {
    text?: string;
    weight?: number;
    concepts?: string[];
    cross_attention_editing?: string;
    cross_attention_weights?: string;
};
declare type InputImage = {
    url: string;
    resize?: "crop" | "center_crop" | "scale";
};
declare type ImagePrompt = {
    image?: InputImage;
    weight?: number;
    cutout_n?: number;
    perceptor?: "vit-l" | "vit-h" | "vit-b" | "vit-g";
};
declare type Prompt = TextPrompt | ImagePrompt;
declare class SelasClient {
    supabase: SupabaseClient;
    constructor(supabase: SupabaseClient);
    signIn(email: string, password: string): Promise<_supabase_supabase_js.AuthResponse>;
    getCustomer(external_id: string): Promise<{
        error: string;
        hint: string;
        data?: undefined;
    } | {
        data: Customer;
        error?: undefined;
        hint?: undefined;
    }>;
    createCustomer(external_id: string): Promise<{
        error: string;
        hint: string;
        data?: undefined;
        message?: undefined;
    } | {
        data: Customer;
        message: string;
        error?: undefined;
        hint?: undefined;
    }>;
    deleteCustomer(external_id: string): Promise<_supabase_supabase_js.PostgrestResponse<undefined>>;
    addCredits(external_id: string, credits: number): Promise<{
        error: string;
        data?: undefined;
        message?: undefined;
    } | {
        data: {
            current_balance: any[];
        };
        message: string;
        error?: undefined;
    }>;
    createToken(external_id: string, quota?: number, ttl?: number, description?: string): Promise<{
        error: string;
        data?: undefined;
        message?: undefined;
    } | {
        data: Token;
        message: string;
        error?: undefined;
    }>;
    postJob(config: Config, token_key?: string): Promise<{
        error: string;
        data?: undefined;
        message?: undefined;
    } | {
        data: Job;
        message: string;
        error?: undefined;
    }>;
    getDreamboothResult(job_id: number): Promise<{
        error: string;
        data?: undefined;
        message?: undefined;
    } | {
        data: DreamboothResult[];
        message: string;
        error?: undefined;
    }>;
    runDreambooth(instance_prompt: string, instance_images: string[], model_name: string, model_description?: string, class_prompt?: string, class_images?: string[], num_class_images?: number, max_train_steps?: number, num_train_epochs?: number, learning_rate?: number, train_text_encoder?: boolean, with_prior_preservation?: boolean, token_key?: string): Promise<{
        error: string;
        data?: undefined;
        message?: undefined;
    } | {
        data: Job;
        message: string;
        error?: undefined;
    }>;
    getClipInterrogateResult(job_id: number): Promise<{
        error: string;
        data?: undefined;
        message?: undefined;
    } | {
        data: ClipInterrogateResult[];
        message: string;
        error?: undefined;
    }>;
    runClipInterrogate(url: string, token_key?: string): Promise<{
        error: string;
        data?: undefined;
        message?: undefined;
    } | {
        data: Job;
        message: string;
        error?: undefined;
    }>;
    getBlipResult(job_id: number): Promise<{
        error: string;
        data?: undefined;
        message?: undefined;
    } | {
        data: BlipResult[];
        message: string;
        error?: undefined;
    }>;
    runBlipCaption(url: string, token_key?: string): Promise<{
        error: string;
        data?: undefined;
        message?: undefined;
    } | {
        data: Job;
        message: string;
        error?: undefined;
    }>;
    getResults(job_id: number): Promise<{
        error: string;
        data?: undefined;
        message?: undefined;
    } | {
        data: Result[];
        message: string;
        error?: undefined;
    }>;
    subscribeToJob(job_id: number, callback: (payload: RealtimePostgresChangesPayload<Job>) => void): Promise<void>;
    subscribeToResults(job_id: number, callback: (payload: RealtimePostgresChangesPayload<Result>) => void): Promise<void>;
    runStableDiffusion(prompt: string, width?: 512 | 768, height?: 512 | 768, steps?: 50, guidance_scale?: number, sampler?: "plms" | "ddim" | "k_lms" | "k_euler" | "k_euler_a", batch_size?: 1 | 2 | 3 | 4, image_format?: "avif" | "jpg" | "png" | "webp", translate?: boolean, diffusion_model?: string, worker_config?: WorkerConfig, token_key?: string): Promise<{
        error: string;
        data?: undefined;
        message?: undefined;
    } | {
        data: Job;
        message: string;
        error?: undefined;
    }>;
}
declare const createBackendSelasClient: () => SelasClient;
declare const createSelasClient: (token_key?: string) => SelasClient;

export { Billing, BlipConfig, BlipResult, ClipInterrogateConfig, ClipInterrogateResult, ClipInterrogation, Config, Customer, DiffusionConfig, DreamboothConfig, DreamboothResult, IOConfig, ImagePrompt, InputImage, Job, Prompt, Result, SelasClient, TextPrompt, TextRank, Token, WorkerConfig, createBackendSelasClient, createSelasClient };
