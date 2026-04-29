import { Injectable, BadRequestException } from '@nestjs/common';
import OpenAI from 'openai';
import { GenerateDto } from './dto/generate.dto';
import { StoryGenerateDto } from './dto/story-generate.dto';

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

  async generateStory(dto: StoryGenerateDto) {
    const contextLine = dto.howMet
      ? `Bối cảnh thực tế của họ: "${dto.howMet}". Hãy dệt chi tiết này vào câu chuyện một cách tự nhiên.`
      : 'Không có thông tin cụ thể — hãy tưởng tượng một bối cảnh Việt Nam thực tế và đời thường.';

    const prompt = `Bạn là nhà văn viết câu chuyện tình yêu cho một cặp đôi Việt Nam sắp kết hôn.

Cặp đôi: ${dto.name1} và ${dto.name2}
${contextLine}

NGUYÊN TẮC VIẾT (BẮT BUỘC):
- Dùng chi tiết cụ thể, giác quan: mùi cà phê, tiếng mưa, ánh đèn vàng, chiếc bàn nhỏ...
- Tránh TUYỆT ĐỐI các cụm từ sáo rỗng: "tình yêu đẹp", "kỷ niệm đáng nhớ", "tình cảm sâu sắc"
- Mỗi đoạn phải có 1 chi tiết cụ thể khiến người đọc hình dung được cảnh vật
- Văn phong như truyện ngắn văn học, không phải mô tả chung chung
- Nhân vật phải sống động, có cảm xúc thật, không phải nhân vật trong truyện cổ tích

Ví dụ ĐÚNG: "Buổi chiều hôm đó, ${dto.name1} đang cúi xuống sắp lại tập tài liệu thì nghe tiếng ghế kéo bên cạnh — ${dto.name2} ngồi xuống và hỏi mượn bút, dù rõ ràng có cả hộp bút ngay trước mặt."
Ví dụ SAI: "Họ gặp nhau và cảm nhận được sự kết nối đặc biệt."

Trả về JSON THUẦN TÚY (không markdown, không giải thích):
{
  "title": "[tiêu đề thơ, ngắn gọn, gợi cảm — KHÔNG dùng chữ 'Chuyện tình' hay 'Câu chuyện']",
  "tagline": "[1 câu dưới 12 từ, mang hình ảnh cụ thể, đọc xong nhớ ngay]",
  "sections": [
    {
      "id": "first-meeting",
      "title": "Lần Đầu Gặp Gỡ",
      "content": "[4-5 câu. Bắt đầu bằng một chi tiết giác quan cụ thể. Kết thúc bằng cảm xúc bên trong, không phải hành động bên ngoài.]"
    },
    {
      "id": "falling-in-love",
      "title": "Yêu Từ Lúc Nào",
      "content": "[4-5 câu. Mô tả một khoảnh khắc bình thường nhưng đột nhiên có ý nghĩa: bữa ăn, cuộc gọi khuya, tin nhắn lúc 2 giờ sáng. Tình yêu đến không có dấu hiệu báo trước.]"
    },
    {
      "id": "special-moments",
      "title": "Những Khoảnh Khắc",
      "content": "[4-5 câu. Một chuyến đi, một ngày mưa, một bữa ăn bị cháy — chi tiết hài hước hoặc ấm áp. Tránh liệt kê, hãy kể một câu chuyện nhỏ.]"
    },
    {
      "id": "proposal",
      "title": "Lời Cầu Hôn",
      "content": "[4-5 câu. Không nhất thiết phải hoành tráng. Có thể bình thường nhưng đúng lúc đúng chỗ — điều đó mới thực sự xúc động. Mô tả không gian, ánh sáng, cảm giác run tay.]"
    },
    {
      "id": "future",
      "title": "Tương Lai Cùng Nhau",
      "content": "[4-5 câu. Không phải ước mơ lớn lao. Là những điều nhỏ bé: buổi sáng nấu cơm, chiều chủ nhật lười biếng, già đi bên nhau và vẫn còn kể chuyện cũ.]"
    }
  ]
}`;

    try {
      const response = await this.client.chat.completions.create({
        model: 'llama-3.1-8b-instant',
        messages: [
          {
            role: 'system',
            content: 'Bạn là nhà văn người Việt chuyên viết truyện ngắn lãng mạn. Văn phong tinh tế, chi tiết cụ thể, tránh sáo ngữ. CHỈ trả về JSON object thuần túy, không có bất kỳ text nào khác ngoài JSON.',
          },
          { role: 'user', content: prompt },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.9,
        max_tokens: 2000,
      });

      const text = response.choices[0].message.content ?? '{}';
      return JSON.parse(text);
    } catch (err) {
      return this.fallbackStory(dto.name1, dto.name2);
    }
  }

  private fallbackStory(name1: string, name2: string) {
    const places = ['Hà Nội', 'Đà Lạt', 'Hội An', 'Sài Gòn', 'Nha Trang'];
    const place = places[Math.floor(Math.random() * places.length)];
    return {
      title: `Chuyện Tình ${name1} & ${name2}`,
      tagline: `Một tình yêu đẹp bắt đầu từ những điều bình thường nhất`,
      sections: [
        {
          id: 'first-meeting',
          title: 'Lần Đầu Gặp Gỡ',
          content: `${name1} và ${name2} gặp nhau lần đầu tại ${place} vào một buổi chiều bình thường mà không ai ngờ sẽ thay đổi cuộc đời cả hai. Ánh mắt giao nhau lần đầu, tim cả hai đều đập nhanh hơn một chút. Họ nói chuyện mãi không biết chán, từ những điều nhỏ nhặt đến những ước mơ lớn lao. Đó là khởi đầu của một câu chuyện tình đẹp.`,
        },
        {
          id: 'falling-in-love',
          title: 'Yêu Từ Lúc Nào',
          content: `Không ai biết chính xác khoảnh khắc nào tình yêu bắt đầu chớm nở trong lòng ${name1} và ${name2}. Có lẽ là lần ${name2} nhớ món ăn yêu thích của ${name1} mà không cần nhắc. Hay là lần ${name1} thức khuya lắng nghe ${name2} kể về những lo lắng nhỏ nhặt. Tình yêu đến nhẹ nhàng như thế, không ồn ào mà thật sâu.`,
        },
        {
          id: 'special-moments',
          title: 'Những Khoảnh Khắc Đáng Nhớ',
          content: `Hai người cùng nhau trải qua biết bao kỷ niệm khó quên. Những chuyến đi xa cùng nhau, những buổi chiều lang thang phố cũ, những bữa ăn khuya sau khi tăng ca mệt mỏi. ${name1} và ${name2} tìm thấy ở nhau một người bạn đồng hành thật sự, người không chỉ ở bên trong niềm vui mà còn vững chắc trong những lúc khó khăn.`,
        },
        {
          id: 'proposal',
          title: 'Lời Cầu Hôn',
          content: `Vào một buổi tối đặc biệt, ${name2} đã chuẩn bị tất cả mọi thứ thật chu đáo và đầy bất ngờ. Khi ${name1} nhìn thấy toàn bộ tâm ý đó, mắt đã đỏ hoe từ lúc nào. Câu hỏi được đặt ra trong tiếng tim đập rộn ràng và câu trả lời là một cái gật đầu đẫm nước mắt hạnh phúc. Đó là khoảnh khắc hai người biết rằng họ thuộc về nhau.`,
        },
        {
          id: 'future',
          title: 'Tương Lai Cùng Nhau',
          content: `${name1} và ${name2} bước vào chặng đường mới với trái tim đầy yêu thương và hy vọng. Họ mơ về một ngôi nhà nhỏ ấm áp, những chuyến đi cùng nhau khắp thế giới, và những bữa sáng bình yên bên nhau mỗi ngày. Tình yêu của họ không chỉ là cảm xúc nhất thời mà là cam kết được xây dựng qua từng ngày sống chung. Câu chuyện tình đẹp nhất vẫn đang ở phía trước.`,
        },
      ],
    };
  }
}
