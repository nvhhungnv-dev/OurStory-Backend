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
    this.client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }

  async generate(dto: GenerateDto) {
    const tone = TONE_LABELS[dto.tone ?? 'romantic'];
    const userPrompt = `
Tạo nội dung thiệp cưới cho:
- Cô dâu: ${dto.bride}
- Chú rể: ${dto.groom}
- Ngày cưới: ${dto.date ?? 'chưa xác định'}
- Câu chuyện tình yêu: ${dto.loveStory ?? 'không có thông tin'}
- Tone: ${tone}
- Template ID: ${dto.templateId}

Trả về JSON với cấu trúc:
{
  "sections": {
    "hero": { "title": "...", "subtitle": "..." },
    "story": { "body": "..." },
    "details": { "date": "...", "venue": "..." }
  }
}
`;

    try {
      const response = await this.client.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `Bạn là copywriter chuyên viết nội dung thiệp cưới Việt Nam.
Viết bằng tiếng Việt, cảm xúc, phù hợp tone được chỉ định.
Chỉ trả về JSON object thuần túy. Không giải thích, không markdown, không code block.`,
          },
          { role: 'user', content: userPrompt },
        ],
        response_format: { type: 'json_object' },
      });

      const text = response.choices[0].message.content ?? '{}';
      return JSON.parse(text);
    } catch (err) {
      throw new BadRequestException('AI generation thất bại: ' + err.message);
    }
  }
}
