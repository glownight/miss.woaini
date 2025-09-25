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
        <p>
          任何一个你不喜欢又离不开的地方，任何一种你不喜欢又摆脱不了的生活就是监狱。
        </p>
        <p>
          如果你感到痛苦和不自由，希望你心里永远有一团不会熄灭的火焰，不要麻木，不要被同化。
        </p>
        <p>拼命成为那个有力量破釜沉舟的人。</p>
      </div>
    ),
  },
  {
    content: (
      <div className="notice-box">
        <p>我站在人潮中央，思考这日日重复的生活。</p>
        <p>
          我突然想，如果有一天，垂老和年轻都难以惊起心中连漪，一潭死水的沉闷，鲜花和蛋糕也撼动不了。
        </p>
        <p>
          如果人开始不能为微小事物而感动。那么地震山洪的噩耗想必也惊闻不了。
        </p>
        <p>如果活着和死亡的本质无异，那便没有了存在的意义。</p>
      </div>
    ),
  },
  {
    content: (
      <div className="notice-box">
        <p>
          人的一生中，最光辉的一天并非是功成名就那天，而是从悲叹与绝望中产生对人生的挑战，以勇敢迈向意志那天。
        </p>
      </div>
    ),
  },
];

const QuoteSwiper: React.FC = () => {
  return (
    <div className="quote-swiper-container">
      {/* 拖拽测试：鼠标点击并左右拖动切换 - 无平移效果 */}
      <div style={{ fontSize: "12px", color: "#666", marginBottom: "10px" }}>
        拖拽测试：鼠标点击并左右拖动切换 - 无平移效果
      </div>
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
          delay: 60000,
          disableOnInteraction: false,
          pauseOnMouseEnter: true,
        }}
        loop={true}
        className="quote-swiper"
        style={{ "--swiper-theme-color": "transparent" } as any}
        onSlideChange={(swiper) =>
          console.log("fade slide changed", swiper.activeIndex)
        }
        onSwiper={(swiper) => {
          console.log("swiper with fade initialized", swiper);
          // 强制设置fade效果
          if (swiper.params.effect !== "fade") {
            console.warn("Fade effect not applied, trying to force");
          }
        }}
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
