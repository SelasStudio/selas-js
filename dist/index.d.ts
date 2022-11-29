import { SupabaseClient } from '@supabase/supabase-js';

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
    branch?: string;
    is_dirty?: boolean;
    name?: string;
    cluster?: string;
    commit?: string;
    tags?: string[];
    services?: string[];
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
    image_format?: "png" | "jpg" | "avif" | "webp";
    image_quality?: number;
    translate?: boolean;
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
    token: string | undefined;
    constructor(supabase: SupabaseClient, token: string);
    postJob: (config: Config) => Promise<{
        error: string;
        data?: undefined;
    } | {
        data: Job;
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
    runClipInterrogate(url: string): Promise<{
        error: string;
        data?: undefined;
    } | {
        data: Job;
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
    runBlipCaption(url: string): Promise<{
        error: string;
        data?: undefined;
    } | {
        data: Job;
        error?: undefined;
    }>;
    fetchResults(job_id: number): Promise<{
        error: string;
        data?: undefined;
        message?: undefined;
    } | {
        data: Result[];
        message: string;
        error?: undefined;
    }>;
    awaitResults: (job: Job, timeout?: number) => Promise<unknown>;
    generateImage({ prompt, format, n_images, quality, export_format, nsfw_filter }: generateImageParams): Promise<{
        error: string;
        data?: undefined;
    } | {
        data: Job;
        error?: undefined;
    }>;
}
declare type generateImageParams = {
    prompt: string;
    format: "landscape" | "portrait" | "square";
    n_images: 1 | 4;
    quality: "minimal" | "normal" | "high";
    export_format: "png" | "jpg" | "webp" | "avif";
    nsfw_filter: boolean;
};
declare const createSelasClient: (token_key: string) => SelasClient;

export { Billing, BlipConfig, BlipResult, ClipInterrogateConfig, ClipInterrogateResult, ClipInterrogation, Config, Customer, DiffusionConfig, DreamboothConfig, DreamboothResult, ImagePrompt, InputImage, Job, Prompt, Result, SelasClient, TextPrompt, TextRank, WorkerConfig, createSelasClient };
