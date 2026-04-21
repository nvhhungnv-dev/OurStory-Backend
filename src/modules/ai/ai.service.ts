import { Injectable, BadRequestException } from '@nestjs/common';
import Anthropic from '@anthropic-ai/sdk';
import { GenerateDto } from './dto/generate.dto';

const TONE_LABELS = {
  romantic: 'lãng mạn, cảm xúc, thơ mộng',
  formal: 'trang trọng, lịch sự, truyền thống',
  fun: 'vui tươi, trẻ trung, năng động',
};

@Injectable()
export class AiService {
  private client: Anthropic;

  constructor() {
    this.client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }

  async generate(dto: GenerateDto) {
    const tone = TONE_LABELS[dto.tone ?? 'romantic'];
    const userPrompt = `Tạo nội dung thiệp cưới cho:
- Cô dâu: ${dto.bride}
- Chú rể: ${dto.groom}
- Ngày cưới: ${dto.date ?? 'chưa xác định'}
- Câu chuyện tình yêu: ${dto.loveStory ?? 'không có thông tin'}
- Tone: ${tone}

Trả về JSON với cấu trúc sau, KHÔNG có markdown hay giải thích:
{"sections":{"hero":{"title":"[tên cô dâu] & [tên chú rể]","subtitle":"[câu tagline lãng mạn ngắn]"},"story":{"body":"[đoạn văn 3-4 câu về câu chuyện tình yêu]"},"details":{"date":"[ngày cưới đẹp]","venue":"[địa điểm gợi ý đẹp ở Việt Nam]"}}}`;

    try {
      const message = await this.client.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1024,
        system: `Bạn là copywriter chuyên viết nội dung thiệp cưới Việt Nam.
Viết bằng tiếng Việt, cảm xúc, phù hợp tone được chỉ định.
Chỉ trả về JSON object thuần túy. Không giải thích, không markdown, không code block.`,
        messages: [{ role: 'user', content: userPrompt }],
      });

      const text = message.content[0].type === 'text' ? message.content[0].text : '';
      const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      return JSON.parse(cleaned);
    } catch (err) {
      throw new BadRequestException('AI generation thất bại: ' + err.message);
    }
  }
}
