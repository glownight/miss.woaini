import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectFade } from "swiper/modules";
import "./QuoteSwiper.css";

interface QuoteItem {
  content: React.ReactNode;
}

const quoteItems: QuoteItem[] = [
  {
    content: (
      <div className="notice-box">
        <p>《劝少年们珍惜时光》</p>
        <p>
          及时采撷你的花蕾／旧时光一去不来/今天尚在微笑的花朵／明天便在风中枯萎
        </p>

        <p>哦，让生活从此变成一首欢乐的诗。</p>
      </div>
    ),
  },
  // {
  //   content: (
  //     <div className="notice-box">
  //       <p>诗歌、美丽、浪漫、爱情，才是我们活着的意义。</p>
  //       <p>你们用不着表演，完全为你自己。</p>
  //       <p>
  //         你们必须努力寻找自己的声音，因为你越迟开始寻找，找到的可能性就越小。
  //       </p>
  //       <p>
  //         听见了吗？CARPE... CARPE DIEM 及时行乐，孩子们，让你的生命超越凡俗。
  //       </p>
  //     </div>
  //   ),
  // },
  // {
  //   content: (
  //     <div className="notice-box">
  //       <p>梭罗说“大多数人都生活在平静的绝望中”。别陷入这种境地，冲出来。</p>
  //       <p>要敢于逆流而上。</p>
  //     </div>
  //   ),
  // },
  // {
  //   content: (
  //     <div className="notice-box">
  //       <p>
  //         因为信不信由你，这个房间里的每个人，总有一天都要停止呼吸，僵冷，死亡。我要你们向前到这儿来，细细玩味过去的面孔，你们经过这儿无数次，但从未真正看过他们，和你的差异并不大，对吧？同样的发型，和你们一样精力旺盛，和你们一样不可一世，世界都在他们的掌握之中，他们认为注定要成就大事，和大多数的你们一样，他们的双眼充满了希望，和你们一样。他们是否虚度时光，到最后一无所成？因为各位所见到的……这些男孩现在都已化为尘土了，如果你们仔细倾听，便能听见他们在低声耳语，附耳过去，仔细听，听见了？CARPE..。听见了吗？CARPE...
  //         CARPE DIEM 及时行乐，孩子们，让你的生命超越凡俗。
  //       </p>
  //     </div>
  //   ),
  // },
];

const QuoteSwiper: React.FC = () => {
  return (
    <div className="quote-swiper-container">
      <Swiper
        modules={[Autoplay, EffectFade]}
        effect="fade"
        fadeEffect={{
          crossFade: true,
        }}
        grabCursor={true}
        allowTouchMove={true}
        simulateTouch={true}
        spaceBetween={0}
        slidesPerView={1}
        speed={900}
        autoplay={{
          delay: 600000,
          disableOnInteraction: false,
          pauseOnMouseEnter: true,
        }}
        loop={true}
        className="quote-swiper"
        style={{ "--swiper-theme-color": "transparent" } as any}
      >
        {quoteItems.map((item, index) => (
          <SwiperSlide key={index}>
            <div className="quote-slide">{item.content}</div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default QuoteSwiper;
