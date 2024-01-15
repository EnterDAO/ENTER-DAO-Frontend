import React, { FC, useState } from 'react';
import Divider from 'antd/es/divider';

import s from './FAQs.module.scss';

type FAQItemProps = {
  question: string;
  answer: string;
};

const FAQItem: FC<FAQItemProps> = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={`${s.faqItem} ${isOpen ? s.faqItemOpen : ''}`} onClick={() => setIsOpen(!isOpen)}>
      <div className={s.faqQuestion} style={isOpen ? { color: '#fff' } : { color: '#000' }}>
        {question}
        <div className={`${s.faqToggle} ${isOpen ? s.faqToggleOpen : s.faqToggleClosed}`}></div>
      </div>
      {isOpen && (
        <>
          <hr className={s.faqDivider} />
          <div style={{ color: '#fff' }} className={s.faqAnswer}>
            {answer}
          </div>
        </>
      )}
    </div>
  );
};

const FAQs: FC = () => {
  // Add your FAQ questions and answers here
  const faqData = [
    {
      question: 'Frequently Asked Question 1',
      answer:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc vulputate libero et velit interdum, ac aliquet odio mattis. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Curabitur tempus urna at turpis condimentum lobortis. Ut commodo efficitur neque.',
    },
    {
      question: 'Frequently Asked Question 2',
      answer:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc vulputate libero et velit interdum, ac aliquet odio mattis. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Curabitur tempus urna at turpis condimentum lobortis. Ut commodo efficitur neque.',
    },
    {
      question: 'Frequently Asked Question 3',
      answer:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc vulputate libero et velit interdum, ac aliquet odio mattis. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Curabitur tempus urna at turpis condimentum lobortis. Ut commodo efficitur neque.',
    },
    {
      question: 'Frequently Asked Question 4',
      answer:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc vulputate libero et velit interdum, ac aliquet odio mattis. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Curabitur tempus urna at turpis condimentum lobortis. Ut commodo efficitur neque.',
    },
  ];

  return (
    <div className={s.faqsContainer}>
      <h2 className={s.faqsTitle}>
        <b>FAQs</b>
      </h2>
      {faqData.map((faq, index) => (
        <FAQItem key={index} question={faq.question} answer={faq.answer} />
      ))}
    </div>
  );
};

export default FAQs;
