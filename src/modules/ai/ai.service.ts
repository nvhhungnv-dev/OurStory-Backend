import { Injectable, BadRequestException } from '@nestjs/common';
import OpenAI from 'openai';
import { GenerateDto } from './dto/generate.dto';

const TONE_LABELS = {
  romantic: 'lãng mạn, cảm xúc, thơ mộng',
  formal: 'trang trọng, lịch sự, truyền thống',
  fun: 'vui tươi, trẻ trung, năng động',
};

@Injectable()
export class AiService {
  private client: OpenAI;

  constructor() {
    this.client = new OpenAI({
      apiKey: process.env.GROQ_API_KEY,
      baseURL: 'https://api.groq.com/openai/v1',
    });
  }

  async generate(dto: GenerateDto) {
    const tone = TONE_LABELS[dto.tone ?? 'romantic'];
    const userPrompt = `Tạo nội dung thiệp cưới cho:
- Cô dâu: ${dto.bride}
- Chú rể: ${dto.groom}
- Ngày cưới: ${dto.date ?? 'chưa xác định'}
- Câu chuyện tình yêu: ${dto.loveStory ?? 'không có thông tin'}
- Tone: ${tone}

Trả về JSON, KHÔNG có markdown:
{"sections":{"hero":{"title":"${dto.bride} & ${dto.groom}","subtitle":"[tagline lãng mạn ngắn]"},"story":{"body":"[đoạn văn 3-4 câu về câu chuyện tình yêu]"},"details":{"date":"[ngày cưới]","venue":"[địa điểm đẹp Việt Nam]"}}}`;

    try {
      const response = await this.client.chat.completions.create({
        model: 'llama-3.1-8b-instant',
        messages: [
          {
            role: 'system',
            content: `Bạn là copywriter chuyên viết nội dung thiệp cưới Việt Nam. Viết bằng tiếng Việt, cảm xúc. Chỉ trả về JSON object thuần túy, không markdown, không giải thích.`,
          },
          { role: 'user', content: userPrompt },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.8,
      });

      const text = response.choices[0].message.content ?? '{}';
      return JSON.parse(text);
    } catch (err) {
      throw new BadRequestException('AI generation thất bại: ' + err.message);
    }
  }
}
