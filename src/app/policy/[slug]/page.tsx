import Image from "next/image";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/molecules/Breadcrumbs";
import { PublicPageHeader } from "@/components/molecules/PublicPageHeader/PublicPageHeader";
import { PolicyClosingNote } from "@/components/organisms/PolicyClosingNote";
import { SiteLayout } from "@/components/templates/SiteLayout";
import { ROUTES } from "@/constants/routes";

type Params = { slug: string };
type PolicySection = {
  heading?: string;
  items?: string[];
  paragraphs?: string[];
  contact?: {
    company: string;
    address: string;
    email: string;
    hotline: string;
  };
};

type Policy = {
  title: string;
  body?: string[];
  intro?: string[];
  sections?: PolicySection[];
};

const POLICIES: Record<string, Policy> = {
  customer: {
    title: "Chính sách khách hàng",
    body: [],
  },
  return: {
    title: "Chính sách đổi hàng",
    intro: [
      "XÉO XỌ hỗ trợ đổi size hoặc đổi mẫu có giá trị tương đương trong vòng 78H tính từ lúc khách hàng thanh toán (áp dụng đối với khách hàng mua trực tiếp tại cửa hàng) và từ lúc nhận hàng (đối với khách hàng mua qua các hình thức online khác nhau).",
    ],
    sections: [
      {
        heading: "Lưu ý:",
        items: [
          "XÉO XỌ hỗ trợ đổi trả đối với sản phẩm còn nguyên tình trạng ban đầu: chưa cắt tag, chưa qua sử dụng và không phát sinh tình trạng lỗi.",
          "Đối với các sản phẩm SALE, đơn may custom và thuộc các dòng phụ kiện không áp dụng chương trình đổi trả.",
        ],
      },
    ],
  },
  inspection: {
    title: "Chính sách kiểm hàng",
    sections: [
      {
        heading: "1. Định nghĩa",
        paragraphs: [
          "Kiểm hàng là thực hiện các công việc kiểm tra và so sánh các sản phẩm hoặc hàng hóa nhận được trong kiện hàng gửi với các sản phẩm trong đơn hàng khách yêu cầu.",
        ],
      },
      {
        heading: "2. Quy định",
        paragraphs: [
          "Thời điểm kiểm hàng.",
          "Chúng tôi chấp nhận cho khách hàng đồng kiểm với nhân viên giao hàng tại thời điểm nhận hàng. Không hỗ trợ thử hàng.",
          "Sau khi nhận hàng, khách hàng kiểm lại phát hiện sai, có thể liên lạc với bộ phận chăm sóc khách hàng để được hỗ trợ đổi trả. Lưu ý, quý khách quay video lúc mở thùng hàng để đối chiếu khi cần thiết.",
          "Phạm vi kiểm tra hàng hóa.",
        ],
        items: [
          "Khách hàng được kiểm tra các sản phẩm thực nhận, đối chiếu, so sánh các sản phẩm nhận được với sản phẩm đã đặt trên đơn sau khi nhân viên xác nhận đơn hàng theo các tiêu chí: ảnh mẫu, mã sản phẩm, kích thước, màu sắc, chất liệu.",
          "Tuyệt đối không bóc, mở các hộp sản phẩm có tem niêm phong, tem đảm bảo.",
          "Không được cào lấy mã các sản phẩm có tích điểm, đổi quà.",
        ],
      },
      {
        heading: "Các bước xử lý khi hàng hóa nhận được không như đơn đặt hàng",
        paragraphs: [
          "Khi quý khách đồng kiểm, sản phẩm nhận được không như sản phẩm khách đặt trên đơn hàng, xin hãy liên hệ với hotline 0394126556 hoặc email info@xeoxo.com để được gặp bộ phận chăm sóc khách hàng xác nhận lại đơn hàng.",
          "Trường hợp chúng tôi đóng sai đơn hàng theo yêu cầu của khách, khách có thể không nhận hàng, không thanh toán. Trong trường hợp đơn hàng đã thanh toán, khách hàng có thể yêu cầu gửi lại đơn mới hoặc không, chúng tôi sẽ hoàn lại tiền cho quý khách trong thời gian sớm nhất.",
          "Trường hợp chúng tôi đóng hàng đúng theo đơn hàng, nhưng khách hàng thay đổi nhu cầu, khách hàng có thể yêu cầu đổi trả và áp dụng chính sách đổi trả hàng hóa. Trường hợp này khách hàng sẽ thanh toán chi phí giao hàng (nếu có).",
        ],
      },
      {
        heading: "Các kênh thông tin tiếp nhận khiếu nại của khách hàng",
        paragraphs: [
          "Người dùng có thể gửi email tới địa chỉ info@xeoxo.com hoặc gọi điện tới hotline 0394126556 để điều chỉnh hoặc xóa đi dữ liệu cá nhân của mình.",
        ],
      },
    ],
  },
  shipping: {
    title: "Chính sách vận chuyển",
    intro: [
      "Phạm vi và thời gian giao hàng: Hình thức giao hàng tiêu chuẩn áp dụng cho tất cả khách hàng trên phạm vi toàn quốc trong thời gian 3 - 5 ngày làm việc (không tính thứ 7, chủ nhật và ngày lễ).",
      "Lưu ý: Thời gian giao hàng dự kiến có thể xê dịch sớm hơn hoặc lâu hơn tùy vào tình hình giao thông, thời tiết cũng như các yếu tố ngoại quan ảnh hưởng đến việc di chuyển của đơn vị vận chuyển từ nơi lấy hàng đến nơi giao hàng.",
      "Mức phí vận chuyển sẽ thay đổi tùy thuộc vào trọng lượng đơn hàng, khoảng cách giữa kho xuất hàng và địa điểm nhận hàng. Mức phí vận chuyển chi tiết sẽ được hiển thị khi đặt hàng.",
    ],
    sections: [
      {
        heading:
          "Phân định trách nhiệm của thương nhân, tổ chức cung ứng dịch vụ logistics về cung cấp chứng từ hàng hóa trong quá trình giao nhận",
      },
      {
        heading: "1. Đối với nhà cung cấp",
        paragraphs: [
          "Cung cấp chứng từ hàng hóa: Nhà cung cấp và thương nhân có trách nhiệm cung cấp đầy đủ và chính xác các chứng từ hàng hóa liên quan bao gồm:",
        ],
        items: [
          "Hóa đơn bán hàng (nếu có).",
          "Giấy chứng nhận nguồn gốc, chất lượng hoặc các giấy phép khác (đối với sản phẩm cần chứng nhận).",
          "Thông tin chi tiết về hàng hóa, bao gồm mã sản phẩm, số lượng, trọng lượng và các yêu cầu đóng gói đặc biệt.",
          "Đảm bảo tính xác thực của chứng từ: Mọi thông tin trong các chứng từ phải chính xác, trung thực và hợp lệ theo quy định pháp luật. Nhà cung cấp chịu trách nhiệm trước pháp luật về các giấy tờ được cung cấp.",
          "Cam kết hợp tác với các đối tác giao hàng uy tín, đảm bảo giao hàng nhanh chóng và an toàn.",
          "Theo dõi và cập nhật trạng thái đơn hàng cho khách hàng.",
        ],
      },
      {
        heading: "2. Đối với đơn vị logistics",
        items: [
          "Kiểm tra và bảo quản chứng từ hàng hóa: Đơn vị cung ứng dịch vụ logistics có trách nhiệm lưu trữ và bảo quản các chứng từ hàng hóa liên quan trong suốt quá trình vận chuyển.",
          "Cung cấp chứng từ cho khách hàng theo yêu cầu: Trong trường hợp cần thiết, đơn vị logistics sẽ phối hợp với Xéo Xọ và nhà cung cấp để cung cấp các chứng từ cho khách hàng nhằm đảm bảo tính minh bạch, xác thực của hàng hóa.",
          "Hỗ trợ xử lý khiếu nại: Nếu có vấn đề phát sinh liên quan đến chứng từ hoặc hàng hóa, đơn vị logistics phối hợp với Xéo Xọ và nhà cung cấp để kiểm tra, xử lý và cung cấp thông tin kịp thời cho khách hàng.",
        ],
      },
      {
        heading: "3. Trách nhiệm của các bên trong trường hợp thất lạc chứng từ",
        paragraphs: [
          "Nếu xảy ra trường hợp thất lạc chứng từ, đơn vị logistics phải thông báo ngay lập tức cho Xéo Xọ và nhà cung cấp để tìm giải pháp thay thế.",
          "Trong trường hợp chứng từ không thể phục hồi, nhà cung cấp và Xéo Xọ sẽ phối hợp giải quyết và chịu trách nhiệm theo các quy định và hợp đồng đã ký.",
        ],
      },
    ],
  },
  payment: {
    title: "Chính sách thanh toán",
    intro: [
      "Khi mua các sản phẩm trên hệ thống website, quý khách hàng có thể tham khảo các hình thức thanh toán như sau:",
    ],
    sections: [
      {
        heading: "1. Thanh toán online qua thẻ tín dụng hoặc thẻ ghi nợ VISA, MASTER CARD, JCB",
        paragraphs: [
          "Khách hàng sử dụng các loại thẻ tín dụng, ghi nợ hoặc trả trước VISA, MasterCard, JCB của các ngân hàng trong nước và nước ngoài phát hành.",
          "Toàn bộ hệ thống thanh toán được bảo mật, khách hàng có thể hoàn toàn yên tâm khi thanh toán bằng hình thức trả trước qua thẻ tín dụng hoặc thẻ ghi nợ tại website.",
          "Giao dịch được ghi nhận là thành công khi khách hàng nhận được thông báo từ hệ thống cổng thanh toán trả về trạng thái “Giao dịch thành công”, đảm bảo số dư, hạn mức và xác thực khách hàng theo quy định sử dụng của thẻ.",
        ],
      },
      {
        heading: "2. Thanh toán online qua thẻ ATM nội địa",
        paragraphs: [
          "Khách hàng thanh toán số tiền mua hàng bằng thẻ ATM nội địa của 28 ngân hàng trong nước phát hành có kết nối với cổng thanh toán.",
          "Hình thức thanh toán đơn giản, dễ sử dụng, trực quan và an toàn chỉ trong 03 bước:",
        ],
        items: [
          "Nhập thông tin thẻ.",
          "Xác thực khách hàng.",
          "Thanh toán và nhận ngay kết quả.",
        ],
      },
      {
        paragraphs: [
          "Ngoài ra, để thanh toán bằng thẻ ngân hàng nội địa, thẻ của khách hàng phải được đăng ký sử dụng tính năng thanh toán trực tuyến hoặc ngân hàng điện tử của ngân hàng.",
          "Giao dịch được ghi nhận là thành công khi khách hàng nhận được thông báo từ hệ thống cổng thanh toán trả về trạng thái “Giao dịch thành công”, đảm bảo số dư, hạn mức và xác thực khách hàng theo quy định sử dụng của thẻ.",
        ],
      },
    ],
  },
  privacy: {
    title: "Chính sách bảo mật",
    sections: [
      {
        heading: "1. Mục đích thu thập và sử dụng thông tin cá nhân",
        items: [
          "Trong giai đoạn đặt hàng, khách hàng sẽ cung cấp cho chúng tôi thông tin cá nhân liên quan: họ tên, địa chỉ, email kèm các thông tin cần liên hệ khác.",
          "Xéo Xọ cam kết bảo mật mọi thông tin của khách hàng khi gửi thông tin cá nhân tới Xéo Xọ.",
          "Tất cả các thông tin cá nhân liên quan khách hàng gửi tới cho chúng tôi chỉ sử dụng cho mục đích liên lạc và trao đổi trực tiếp với quý khách trong thời gian phát sinh đơn hàng tại Xéo Xọ.",
          "Chúng tôi cam kết không trao đổi mua bán thông tin khách hàng vì mục đích thương mại.",
          "Chính sách bảo vệ thông tin người tiêu dùng chỉ áp dụng những thông tin mà quý khách hàng gửi trên website chính thức xeoxo.com của chúng tôi. Mọi thông tin quý khách đăng ký tại những website hoặc những địa chỉ khác đều không thuộc phạm vi hiệu lực của chính sách này.",
        ],
      },
      {
        heading: "2. Phạm vi sử dụng thông tin",
        items: [
          "Cung cấp các dịch vụ đến khách hàng.",
          "Liên lạc và giải quyết đối với khách hàng trong những trường hợp đặc biệt.",
          "Không sử dụng thông tin cá nhân của khách hàng ngoài mục đích xác nhận và liên hệ khi khách hàng có nhu cầu mua sản phẩm của chúng tôi.",
        ],
      },
      {
        heading: "3. Thời gian lưu trữ thông tin",
        items: [
          "Dữ liệu cá nhân của thành viên sẽ được lưu trữ cho đến khi có yêu cầu ban quản trị hủy bỏ. Còn lại trong mọi trường hợp, thông tin cá nhân thành viên sẽ được bảo mật trên máy chủ của chúng tôi.",
        ],
      },
      {
        heading: "4. Những người hoặc tổ chức có thể được tiếp cận với thông tin đó",
        items: [
          "Những thông tin thu thập của thành viên sẽ được ban quản trị tiếp cận, khách hàng và các cơ quan chức năng khi có yêu cầu.",
        ],
      },
      {
        heading:
          "5. Phương thức và công cụ để người tiêu dùng tiếp cận và chỉnh sửa dữ liệu cá nhân của mình trên hệ thống thương mại điện tử của đơn vị thu thập thông tin",
        items: [
          "Khách hàng có quyền tự kiểm tra, cập nhật, điều chỉnh hoặc hủy bỏ thông tin cá nhân của mình bằng cách liên hệ với ban quản trị website thực hiện việc này.",
          "Khách hàng có quyền gửi khiếu nại về nội dung bảo mật thông tin, đề nghị liên hệ ban quản trị của website. Khi tiếp nhận những phản hồi này, chúng tôi sẽ xác nhận lại thông tin; trường hợp đúng như phản ánh của khách hàng, tùy theo mức độ, chúng tôi sẽ có những biện pháp xử lý kịp thời.",
        ],
      },
      {
        heading:
          "6. Cơ chế tiếp nhận và giải quyết khiếu nại liên quan đến việc thông tin cá nhân khách hàng",
        items: [
          "Thông tin cá nhân của khách hàng được cam kết bảo mật tuyệt đối theo chính sách bảo vệ thông tin cá nhân. Việc thu thập và sử dụng thông tin của mỗi khách hàng chỉ được thực hiện khi có sự đồng ý của khách hàng đó, trừ những trường hợp pháp luật có quy định khác.",
          "Không sử dụng, không chuyển giao, cung cấp hay tiết lộ cho bên thứ 3 nào về thông tin cá nhân của khách hàng khi không có sự cho phép đồng ý từ khách hàng.",
          "Trong trường hợp máy chủ lưu trữ thông tin bị hacker tấn công dẫn đến mất mát dữ liệu cá nhân khách hàng, chúng tôi sẽ có trách nhiệm thông báo vụ việc cho cơ quan chức năng điều tra xử lý kịp thời và thông báo cho khách hàng được biết.",
          "Bảo mật tuyệt đối mọi thông tin giao dịch trực tuyến của khách hàng bao gồm thông tin hóa đơn kế toán, chứng từ số hóa.",
          "Ban quản lý yêu cầu các cá nhân khi đăng ký hoặc mua hàng phải cung cấp đầy đủ thông tin cá nhân có liên quan như họ và tên, địa chỉ liên lạc, email, điện thoại và chịu trách nhiệm về tính pháp lý của những thông tin trên. Ban quản lý không chịu trách nhiệm cũng như không giải quyết mọi khiếu nại có liên quan đến quyền lợi của thành viên đó nếu xét thấy tất cả thông tin cá nhân của thành viên đó cung cấp khi đăng ký ban đầu là không chính xác.",
          "Khi phát hiện thông tin cá nhân của mình bị sử dụng sai mục đích hoặc phạm vi đã thông báo, thành viên có thể cung cấp các thông tin, chứng cứ liên quan đến việc này để được hỗ trợ xử lý.",
        ],
      },
      {
        heading: "7. Địa chỉ của đơn vị thu thập và quản lý thông tin",
        contact: {
          company: "CÔNG TY TNHH MAI AN KIM VIỆT NAM",
          address:
            "96 tổ 14D, Phường Thanh Lương, Quận Hai Bà Trưng, Thành phố Hà Nội, Việt Nam",
          email: "info@xeoxo.com",
          hotline: "0394126556",
        },
      },
    ],
  },
  care: {
    title: "Hướng dẫn giặt là",
    body: [
      "Nên giặt nhẹ, tránh chà xát mạnh và phơi ở nơi thoáng mát để giữ chất liệu luôn bền đẹp.",
    ],
  },
};

const POINT_POLICY = [
  "Khi mua sắm tại XÉO XỌ, khách hàng sẽ được tích điểm tích lũy dựa theo số tiền đã mua sắm.",
  "Với mỗi hóa đơn mua hàng được quy đổi thành điểm: 50.000 vnđ = 1 điểm tích lũy.",
  "Khách hàng có thể sử dụng điểm tích lũy để quy đổi thành giảm giá cho hóa đơn mua hàng lần sau: 1 điểm tích lũy = 1.000 vnđ",
];

const MEMBER_STEPS = [
  "Mua sắm tại các cửa hàng vật lý và các nền tảng online của XÉO XỌ.",
  "Đăng ký thông tin cá nhân tích điểm bằng tên và số điện thoại tích điểm.",
  "Tận hưởng những ưu đãi đặc biệt của XÉO XỌ.",
];

const MEMBER_TIERS = [
  "Tích lũy mua sắm 20 triệu đồng để trở thành thành viên SILVER với ưu đãi voucher sinh nhật hấp dẫn.",
  "Tích lũy mua sắm 50 triệu đồng để trở thành thành viên GOLD với những ưu đãi miễn phí vận chuyển và voucher sinh nhật hấp dẫn.",
  "Tích lũy mua sắm 100 triệu đồng để trở thành thành viên DIAMOND với ưu đãi miễn phí vận chuyển, miễn phí dịch vụ may đo và voucher sinh nhật hấp dẫn.",
  "Tích lũy mua sắm 200 triệu đồng để trở thành thành viên MVG với ưu đãi đãi miễn phí vận chuyển, miễn phí dịch vụ may đo, phần quà đặc biệt tri ân của XÉO XỌ và voucher sinh nhật hấp dẫn.",
];

const MAINTENANCE_RULES = [
  "SILVER: Tích lũy tối thiểu 6 triệu trên 1 năm (từ 01/01 đến 31/12 của năm liền trước)",
  "GOLD: Tích lũy tối thiểu 10 triệu trên 1 năm (từ 01/01 đến 31/12 của năm liền trước)",
  "DIAMOND: Tích lũy tối thiểu 20 triệu trên 1 năm (từ 01/01 đến 31/12 của năm liền trước)",
  "MVG: Tích lũy tối thiểu 40 triệu trên 1 năm (từ 01/01 đến 31/12 của năm liền trước)",
];

const NOTES = [
  "Điểm tích lũy sẽ không được áp dụng cho: Sản phẩm giảm giá, hóa đơn thanh toán bằng điểm thưởng, hóa đơn thanh toán bằng voucher, hóa đơn mua hàng trên các sàn thương mại điện tử",
  "Không chuyển nhượng điểm giữa các khách hàng dưới mọi hình thức.",
  "Trường hợp không đủ điều kiện duy trì hạng trong 01 năm, năm kế tiếp sẽ giảm xuống hạng tương ứng với điều kiện duy trì đã đạt đủ",
  "Hạng khách hàng sẽ được điều chỉnh 1 lần/năm vào ngày 01/01.",
];

export function generateStaticParams() {
  return Object.keys(POLICIES).map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const policy = POLICIES[slug];

  if (!policy) {
    return { title: "Không tìm thấy chính sách" };
  }

  return { title: policy.title };
}

export default async function PolicyPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const policy = POLICIES[slug];

  if (!policy) {
    notFound();
  }

  if (slug === "customer") {
    return <CustomerPolicyPage />;
  }

  return (
    <GenericPolicyPage title={policy.title} policy={policy} />
  );
}

function CustomerPolicyPage() {
  return (
    <SiteLayout>
      <div className="bg-background">
        <section className="breadcrumb-shell">
          <div className="mx-auto w-full max-w-content">
          <Breadcrumbs
            items={[
              {
                label: "",
                href: ROUTES.HOME,
                iconSrc: "/icons/home.svg",
                iconAlt: "Trang chủ",
              },
              { label: "Chính sách chăm sóc khách hàng" },
            ]}
          />
          </div>
        </section>

        <PublicPageHeader
          title="Chính sách khách hàng"
          titleClassName="text-foreground"
        />

        <article className="site-container pb-12 pt-6 text-foreground md:pb-14 md:pt-8">
          <div className="mx-auto w-full max-w-content text-base font-light leading-relaxed text-black">
          <section className="space-y-4 md:space-y-5">
            <p>
              Chào mừng Quý khách đã đến với{" "}
              <strong className="font-bold">XÉO XỌ,</strong>
            </p>
            <p>
              Để đem đến trải nghiệm mua sắm của mọi người được tốt nhất,{" "}
              <strong className="font-bold">XÉO XỌ</strong> xin được đưa đến cho
              Quý khách chương trình KHÁCH HÀNG THÂN THIẾT của chúng tôi:
            </p>
            <p>
              Chính sách bao gồm 4 mốc tích điểm:{" "}
              <strong className="font-bold">SILVER, GOLD, DIAMOND, MVG.</strong>
            </p>
          </section>

          <section className="mt-10 grid items-start gap-10 lg:grid-cols-2 xl:gap-12">
            <div className="max-w-[76ch] space-y-7">
              <h2 className="text-base font-bold text-black md:text-lg">
                Chính sách tích điểm
              </h2>
              <PolicyList items={POINT_POLICY} />

              <h2 className="max-w-[616px] pt-1 text-base font-bold text-black md:text-lg">
                Trở thành khách hàng thân thiết của XÉO XỌ qua các bước sau:
              </h2>
              <PolicyList items={MEMBER_STEPS} />

              <h2 className="max-w-[616px] pt-1 text-base font-bold text-black md:text-lg">
                Hãy trở thành thành viên SILVER - GOLD - DIAMOND - MVG của XÉO
                XỌ ngay hôm nay:
              </h2>
              <PolicyList items={MEMBER_TIERS} />
            </div>

            <div className="relative mx-auto w-full max-w-[764px] self-start overflow-hidden bg-muted lg:mx-0">
              <Image
                src="/images/policy.svg"
                alt="Bảng chính sách khách hàng thân thiết XÉO XỌ 2024"
                width={764}
                height={1069}
                className="h-auto w-full object-cover"
                priority
              />
            </div>
          </section>

          <section className="mt-12 space-y-6">
            <h2 className="text-base font-bold text-black md:text-lg">
              Điều kiện duy trì thành viên trong 1 năm
            </h2>
            <PolicyList items={MAINTENANCE_RULES} />

            <h2 className="pt-1 text-base font-bold text-black md:text-lg">
              Lưu ý:
            </h2>
            <PolicyList items={NOTES} />
            <p className="pt-1">
              Chính sách khách hàng sẽ được duy trì thực hiện cho đến thông báo
              mới nhất.
            </p>
          </section>
          </div>
        </article>

        <PolicyClosingNote />
      </div>
    </SiteLayout>
  );
}

function PolicyList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-3 pl-6 marker:text-[0.9em] md:pl-8">
      {items.map((item) => (
        <li key={item} className="list-disc pl-1 text-justify">
          {item}
        </li>
      ))}
    </ul>
  );
}

function GenericPolicyPage({
  title,
  policy,
}: {
  title: string;
  policy: Policy;
}) {
  const intro = policy.intro ?? policy.body ?? [];
  const sections = policy.sections ?? [];

  return (
    <SiteLayout>
      <div className="bg-background">
        <section className="breadcrumb-shell">
          <div className="mx-auto w-full max-w-content">
          <Breadcrumbs
            items={[
              {
                label: "",
                href: ROUTES.HOME,
                iconSrc: "/icons/home.svg",
                iconAlt: "Trang chủ",
              },
              { label: title },
            ]}
          />
          </div>
        </section>

        <PublicPageHeader title={title} titleClassName="text-foreground" />

        <article className="site-container pb-12 pt-6 text-foreground md:pb-14 md:pt-8">
          <div className="mx-auto w-full max-w-content text-base font-light leading-relaxed text-black">
          {intro.length > 0 ? (
            <section className="space-y-4 md:space-y-5">
              {intro.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </section>
          ) : null}

          {sections.length > 0 ? (
            <section className="mt-10 space-y-6">
              {sections.map((section, index) => (
                <div key={`${section.heading ?? "section"}-${index}`} className="space-y-4">
                  {section.heading ? (
                    <h2 className="text-base font-bold text-black md:text-lg">{section.heading}</h2>
                  ) : null}
                  {section.paragraphs?.length ? (
                    <div className="space-y-4">
                      {section.paragraphs.map((paragraph) => (
                        <p key={paragraph}>{paragraph}</p>
                      ))}
                    </div>
                  ) : null}
                  {section.items?.length ? <PolicyList items={section.items} /> : null}
                  {section.contact ? <PolicyContactBlock contact={section.contact} /> : null}
                </div>
              ))}
            </section>
          ) : null}
          </div>
        </article>

        <PolicyClosingNote />
      </div>
    </SiteLayout>
  );
}

function PolicyContactBlock({
  contact,
}: {
  contact: {
    company: string;
    address: string;
    email: string;
    hotline: string;
  };
}) {
  return (
    <div className="rounded-md border border-border bg-card px-5 py-4 text-left">
      <p className="text-base font-bold text-black md:text-lg">{contact.company}</p>
      <div className="mt-3 space-y-2">
        <p className="text-base font-light leading-relaxed text-black">Địa chỉ: {contact.address}</p>
        <p className="text-base font-light leading-relaxed text-black">Email: {contact.email}</p>
        <p className="text-base font-light leading-relaxed text-black">Hotline: {contact.hotline}</p>
      </div>
    </div>
  );
}
