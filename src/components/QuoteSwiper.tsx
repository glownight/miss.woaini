import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
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
          我正在寻找一个能与自己同生共死，能与自己同死共生，能与自己同生共生，能与自己同死共生，能与自己同生共生，能与自己同死共生，能与自己同生共生，能与自己同死共生，能与自己同生共生，能与自己同死共生，能与自己同生共生，能与
        </p>
      </div>
    ),
  },
];

const QuoteSwiper: React.FC = () => {
  return (
    <div className="quote-swiper-container">
      <Swiper
        modules={[Autoplay]}
        grabCursor={true}
        spaceBetween={30}
        slidesPerView={1}
        speed={800}
        autoplay={{
          delay: 5000,
          disableOnInteraction: false,
          pauseOnMouseEnter: true,
        }}
        loop={true}
        className="quote-swiper"
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
