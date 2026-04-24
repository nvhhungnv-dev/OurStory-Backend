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

Trả về JSON object thuần túy, KHÔNG có markdown, KHÔNG có giải thích. Cấu trúc chính xác như sau:
{
  "sections": {
    "hero": {
      "title": "${dto.bride} & ${dto.groom}",
      "subtitle": "[ngày cưới và địa điểm ngắn gọn]",
      "caption": "[lời chào mời trân trọng 1 câu]"
    },
    "story": {
      "title": "[tiêu đề lãng mạn về câu chuyện tình]",
      "body": "[đoạn văn 3-4 câu về hành trình tình yêu, dựa vào loveStory nếu có]"
    },
    "quote": {
      "body": "[trích dẫn thơ/lời yêu ý nghĩa, 1-2 câu, italic]"
    },
    "venue": {
      "title": "[tên địa điểm tổ chức đám cưới đẹp tại Việt Nam]",
      "body": "[thông tin đầy đủ: ngày giờ, địa chỉ, dress code — emoji]"
    },
    "details": {
      "title": "Thông tin lễ cưới",
      "body": "[ngày giờ, địa điểm, dress code đầy đủ]"
    },
    "countdown": {
      "subtitle": "[câu đếm ngược lãng mạn ngắn]"
    },
    "parents": {
      "caption": "[lời hai họ kính mời trân trọng]",
      "title": "Nhà Gái",
      "body": "[tên cha mẹ cô dâu placeholder]"
    },
    "dresscode": {
      "title": "Trang phục dự tiệc",
      "body": "[gợi ý trang phục và màu sắc phù hợp tone thiệp]"
    },
    "program": {
      "title": "Chương trình lễ cưới"
    },
    "rsvp": {
      "title": "Xác nhận tham dự",
      "body": "[lời nhờ xác nhận trân trọng, deadline trước ngày cưới 2 tuần]"
    },
    "intro": {
      "body": "[lời mở đầu cảm xúc, 2-3 câu trân trọng]"
    },
    "invitation": {
      "title": "Thiệp Mời",
      "body": "[lời mời trang trọng đầy đủ]"
    },
    "closing": {
      "title": "[lời kết ngắn, ấm áp]",
      "body": "[câu kết lãng mạn]"
    }
  }
}`;

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
