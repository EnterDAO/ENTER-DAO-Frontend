import React, { FC, useState } from 'react';
import ExternalLink from 'components/custom/externalLink';
import { Text } from 'components/custom/typography';

import s from './FAQs.module.scss';

type FAQItemProps = {
  question: any;
  answer: any;
};

const answerStyle: React.CSSProperties = {
  fontSize: '16px',
  fontWeight: '400',
  lineHeight: '24px',
};

const questionStyle: React.CSSProperties = {
  fontSize: '21px',
  fontWeight: '400',
  lineHeight: '24px',
};

const FAQItem: FC<FAQItemProps> = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={`${s.faqItem} ${isOpen ? s.faqItemOpen : ''}`}>
      <div
        className={s.faqQuestion}
        style={isOpen ? { color: '#fff' } : { color: '#000' }}
        onClick={() => setIsOpen(!isOpen)}>
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
  const faqData = [
    {
      question: (
        <span style={{ ...questionStyle }}>What happens if I don’t have the amount of tokens I’m eligible for? </span>
      ),
      answer: (
        <span style={{ ...answerStyle }}>
          Do your best to acquire the remaining tokens, If not - you can always redeem for how much you have but you
          will be missing out.{' '}
        </span>
      ),
    },
    {
      question: <span style={{ ...questionStyle }}>Can I make multiple claims?</span>,
      answer: (
        <span style={{ ...answerStyle }}>
          No! You can make only a single claim, so make sure you are claiming for all the tokens you are eligible for.
        </span>
      ),
    },
    {
      question: <span style={{ ...questionStyle }}>What happens to my staked ENTR? </span>,
      answer: (
        <span style={{ ...answerStyle }}>
          Staked ENTR is taken into consideration for the snapshot. Simply withdrawing your ENTR tokens from the DAO and
          claim a portion of the treasury.{' '}
        </span>
      ),
    },
    {
      question: (
        <span style={{ ...questionStyle }}>What happens to the funds I have deposited in ENTR’s liquidity pools?</span>
      ),
      answer: (
        <Text
          type="p1"
          style={{
            fontSize: '16px',
            fontWeight: '400',
            lineHeight: '24px',
          }}>
          Funds can be withdrawn from the pools. We are aware that the liquidity pools get stuck due to inactivity and
          once this happens they request a disproportionate amount of gas. We have outlined how this can be fixed in{' '}
          <ExternalLink type="button" href="https://medium.com/enterdao">
            {/* TODO add real link to article */}
            <span
              style={{
                color: '#ED9199',
                fontSize: '16px',
                fontWeight: '400',
              }}>
              this article
            </span>
          </ExternalLink>
          .
        </Text>
      ),
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
