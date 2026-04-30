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
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: 'Bạn là nhà văn người Việt chuyên viết truyện ngắn lãng mạn. Văn phong tinh tế, chi tiết cụ thể, tránh sáo ngữ. CHỈ trả về JSON object thuần túy, không có bất kỳ text nào khác ngoài JSON.',
          },
          { role: 'user', content: prompt },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.92,
        max_tokens: 2400,
      });

      const text = response.choices[0].message.content ?? '{}';
      return JSON.parse(text);
    } catch (err) {
      return this.fallbackStory(dto.name1, dto.name2);
    }
  }

  private fallbackStory(name1: string, name2: string) {
    const scenarios = [
      { place: 'Hà Nội', detail: 'một quán cà phê nhỏ trên phố Tây Sơn, hôm đó mưa tầm tã và cả hai đều chạy vào trú tạm', season: 'chiều thu' },
      { place: 'Đà Lạt', detail: 'chuyến leo núi tập thể mà cả hai cùng lạc đường, phải hỏi đường nhau rồi quyết định đi cùng', season: 'sáng sương' },
      { place: 'Sài Gòn', detail: 'góc văn phòng quen thuộc, cạnh nhau mỗi ngày mà mãi tới lần ${name2} mượn bút mới thực sự để ý', season: 'buổi chiều' },
    ];
    const s = scenarios[Math.floor(Math.random() * scenarios.length)];
    return {
      title: `${name1} & ${name2}`,
      tagline: `Gặp nhau đúng lúc, ở lại đúng người`,
      sections: [
        {
          id: 'first-meeting',
          title: 'Lần Đầu Gặp Gỡ',
          content: `${name1} và ${name2} gặp nhau tại ${s.detail}. ${s.place} ${s.season} hôm đó không có gì đặc biệt ngoài việc cả hai đều quên mất thời gian. Câu chuyện cứ nối tiếp nhau, từ chủ đề này sang chủ đề khác, cho đến khi trời tối hẳn mới nhận ra. Lúc chia tay, ${name1} đứng một lúc nhìn theo rồi tự hỏi không biết có dịp gặp lại không.`,
        },
        {
          id: 'falling-in-love',
          title: 'Yêu Từ Lúc Nào',
          content: `${name2} không nhớ chính xác khoảnh khắc nào mình bắt đầu để ý. Có lẽ là lần ${name1} nhắn tin lúc 11 giờ đêm hỏi "ăn chưa?" — đơn giản vậy thôi mà tim lại đập khác đi. Hoặc lần ${name1} nhớ chi tiết nhỏ ${name2} kể tuần trước mà bản thân còn quên. Tình yêu kiểu đó không đến ồn ào — nó ngấm dần như mưa phùn, đến lúc nhận ra thì đã ướt hết rồi.`,
        },
        {
          id: 'special-moments',
          title: 'Những Khoảnh Khắc',
          content: `Chuyến đi ${s.place} năm đó hai người cùng lạc đường, bản đồ offline không có sóng, và cả hai phải hỏi đường người địa phương bằng thứ ${s.place === 'Đà Lạt' ? 'tiếng Kinh lơ lớ' : 'giọng miền nghe không quen'}. ${name1} cười sặc sụa còn ${name2} thì giả vờ nghiêm mặt. Về nhà ai cũng nói chuyến đó vui nhất năm — nhưng lý do thật sự không ai nói ra.`,
        },
        {
          id: 'proposal',
          title: 'Lời Cầu Hôn',
          content: `Không có hoa, không có nhẫn kim cương, không có màn hình LED. ${name2} hỏi vào một buổi tối thường, khi cả hai đang ngồi ăn cơm nhà, đèn vàng chiếu xuống bàn. Chỉ một câu — và ${name1} im lặng đủ lâu để ${name2} bắt đầu lo. Rồi ${name1} gật đầu, mắt đỏ hoe, và bữa cơm tối hôm đó nguội hẳn vì không ai còn nhớ ăn nữa.`,
        },
        {
          id: 'future',
          title: 'Tương Lai Cùng Nhau',
          content: `${name1} và ${name2} không mơ điều gì to lớn — chỉ muốn thức dậy mỗi sáng bên cạnh người mình chọn. Một buổi sáng ${name2} nấu cháo bị hơi mặn, ${name1} vẫn ăn hết rồi khen ngon. Những điều nhỏ như vậy — chứ không phải những ngày trọng đại — mới là thứ giữ hai người lại với nhau qua mọi mùa.`,
        },
      ],
    };
  }
}
