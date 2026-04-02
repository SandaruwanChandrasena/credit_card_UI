import React, { useEffect, useMemo, useRef, useState } from "react";
import "./CreditCardForm.css";

const CustomSelect = ({
  label,
  value,
  options,
  placeholder,
  onChange,
  onFocusCard,
  onBlurCard,
  dataRef,
}) => {
  const [open, setOpen] = useState(false);
  const selectRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setOpen(false);
        onBlurCard?.();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onBlurCard]);

  const handleToggle = () => {
    setOpen((prev) => {
      const next = !prev;
      if (next) {
        onFocusCard?.({
          target: {
            dataset: {
              ref: dataRef,
            },
          },
        });
      } else {
        onBlurCard?.();
      }
      return next;
    });
  };

  const handleSelect = (optionValue) => {
    onChange(optionValue);
    setOpen(false);
    onBlurCard?.();
  };

  const selectedLabel =
    options.find((option) => option.value === value)?.label || placeholder;

  return (
    <div className="custom-select" ref={selectRef}>
      <label className="card-input__label">{label}</label>

      <button
        type="button"
        className={`custom-select__trigger ${open ? "is-open" : ""}`}
        onClick={handleToggle}
      >
        <span className={value ? "custom-select__value" : "custom-select__placeholder"}>
          {selectedLabel}
        </span>
        <span className={`custom-select__arrow ${open ? "is-open" : ""}`}>⌄</span>
      </button>

      {open && (
        <div className="custom-select__menu">
          {options.map((option) => (
            <button
              type="button"
              key={option.value}
              className={`custom-select__option ${
                value === option.value ? "is-selected" : ""
              }`}
              onClick={() => handleSelect(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const CreditCardForm = () => {
  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardMonth, setCardMonth] = useState("");
  const [cardYear, setCardYear] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [isCardFlipped, setIsCardFlipped] = useState(false);
  const [focusElementStyle, setFocusElementStyle] = useState(null);
  const [isInputFocused, setIsInputFocused] = useState(false);

  const minCardYear = new Date().getFullYear();
  const amexCardMask = "#### ###### #####";
  const otherCardMask = "#### #### #### ####";

  const cardNumberRef = useRef(null);
  const cardNameRef = useRef(null);
  const cardDateRef = useRef(null);
  const cardNumberInputRef = useRef(null);

  const cardBackground =
    "https://images.unsplash.com/photo-1557683316-973673baf926?auto=format&fit=crop&w=1200&q=80";

  useEffect(() => {
    cardNumberInputRef.current?.focus();
  }, []);

  const cleanCardNumber = useMemo(() => {
    return cardNumber.replace(/\s/g, "");
  }, [cardNumber]);

  const getCardType = useMemo(() => {
    if (/^4/.test(cleanCardNumber)) return "visa";
    if (/^(34|37)/.test(cleanCardNumber)) return "amex";
    if (/^5[1-5]/.test(cleanCardNumber)) return "mastercard";
    if (/^6011/.test(cleanCardNumber)) return "discover";
    if (/^9792/.test(cleanCardNumber)) return "troy";
    return "visa";
  }, [cleanCardNumber]);

  const minCardMonth = useMemo(() => {
    if (Number(cardYear) === minCardYear) {
      return new Date().getMonth() + 1;
    }
    return 1;
  }, [cardYear, minCardYear]);

  useEffect(() => {
    if (cardMonth && Number(cardMonth) < minCardMonth) {
      setCardMonth("");
    }
  }, [cardMonth, minCardMonth]);

  const monthOptions = Array.from({ length: 12 }, (_, i) => i + 1)
    .filter((n) => n >= minCardMonth)
    .map((n) => {
      const value = n < 10 ? `0${n}` : `${n}`;
      return { value, label: value };
    });

  const yearOptions = Array.from({ length: 12 }, (_, i) => minCardYear + i).map(
    (year) => ({
      value: `${year}`,
      label: `${year}`,
    })
  );

  const getTargetRef = (refName) => {
    if (refName === "cardNumber") return cardNumberRef.current;
    if (refName === "cardName") return cardNameRef.current;
    if (refName === "cardDate") return cardDateRef.current;
    return null;
  };

  const focusInput = (e) => {
    setIsInputFocused(true);
    const targetRefName = e.target.dataset.ref;
    const target = getTargetRef(targetRefName);

    if (target) {
      setFocusElementStyle({
        width: `${target.offsetWidth}px`,
        height: `${target.offsetHeight}px`,
        transform: `translateX(${target.offsetLeft}px) translateY(${target.offsetTop}px)`,
      });
    }
  };

  const blurInput = () => {
    setTimeout(() => {
      if (!isInputFocused) {
        setFocusElementStyle(null);
      }
    }, 200);

    setIsInputFocused(false);
  };

  const formatCardNumber = (value) => {
    const digitsOnly = value.replace(/\D/g, "");
    const isAmex = /^(34|37)/.test(digitsOnly);
    const maxLength = isAmex ? 15 : 16;
    const trimmed = digitsOnly.slice(0, maxLength);

    if (isAmex) {
      const part1 = trimmed.slice(0, 4);
      const part2 = trimmed.slice(4, 10);
      const part3 = trimmed.slice(10, 15);
      return [part1, part2, part3].filter(Boolean).join(" ");
    }

    return trimmed.replace(/(.{4})/g, "$1 ").trim();
  };

  const handleCardNumberChange = (e) => {
    setCardNumber(formatCardNumber(e.target.value));
  };

  const handleCardNameChange = (e) => {
    setCardName(e.target.value.toUpperCase());
  };

  const handleCardCvvChange = (e) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 4);
    setCardCvv(value);
  };

  const renderCardNumber = () => {
    const mask = getCardType === "amex" ? amexCardMask : otherCardMask;

    return mask.split("").map((char, index) => {
      const currentChar = cardNumber[index];

      const shouldMask =
        getCardType === "amex"
          ? index > 4 && index < 14 && currentChar && char.trim() !== ""
          : index > 4 && index < 15 && currentChar && char.trim() !== "";

      return (
        <span key={index}>
          {shouldMask ? (
            <div className="card-item__numberItem">*</div>
          ) : currentChar ? (
            <div
              className={`card-item__numberItem ${
                char.trim() === "" ? "-active" : ""
              }`}
            >
              {currentChar}
            </div>
          ) : (
            <div
              className={`card-item__numberItem ${
                char.trim() === "" ? "-active" : ""
              }`}
            >
              {char}
            </div>
          )}
        </span>
      );
    });
  };

  return (
    <div className="wrapper">
      <div className="card-form">
        <div className="card-list">
          <div className={`card-item ${isCardFlipped ? "-active" : ""}`}>
            <div className="card-item__side -front">
              <div
                className={`card-item__focus ${focusElementStyle ? "-active" : ""}`}
                style={focusElementStyle || {}}
              ></div>

              <div className="card-item__cover">
                <img
                  src={cardBackground}
                  className="card-item__bg"
                  alt="Card background"
                />
              </div>

              <div className="card-item__wrapper">
                <div className="card-item__top">
                  <img
                    src="https://raw.githubusercontent.com/muhammederdem/credit-card-form/master/src/assets/images/chip.png"
                    className="card-item__chip"
                    alt="Chip"
                  />

                  <div className="card-item__type">
                    <img
                      src={`https://raw.githubusercontent.com/muhammederdem/credit-card-form/master/src/assets/images/${getCardType}.png`}
                      alt={getCardType}
                      className="card-item__typeImg"
                    />
                  </div>
                </div>

                <label
                  htmlFor="cardNumber"
                  className="card-item__number"
                  ref={cardNumberRef}
                >
                  {renderCardNumber()}
                </label>

                <div className="card-item__content">
                  <label
                    htmlFor="cardName"
                    className="card-item__info"
                    ref={cardNameRef}
                  >
                    <div className="card-item__holder">Card Holder</div>
                    <div className="card-item__name">
                      {cardName.length
                        ? cardName.replace(/\s\s+/g, " ")
                        : "FULL NAME"}
                    </div>
                  </label>

                  <div className="card-item__date" ref={cardDateRef}>
                    <label className="card-item__dateTitle">Expires</label>
                    <label className="card-item__dateItem">
                      <span>{cardMonth || "MM"}</span>
                    </label>
                    /
                    <label className="card-item__dateItem">
                      <span>{cardYear ? String(cardYear).slice(2, 4) : "YY"}</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div className="card-item__side -back">
              <div className="card-item__cover">
                <img
                  src={cardBackground}
                  className="card-item__bg"
                  alt="Card background"
                />
              </div>

              <div className="card-item__band"></div>

              <div className="card-item__cvv">
                <div className="card-item__cvvTitle">CVV</div>
                <div className="card-item__cvvBand">
                  {cardCvv.split("").map((_, index) => (
                    <span key={index}>*</span>
                  ))}
                </div>

                <div className="card-item__type">
                  <img
                    src={`https://raw.githubusercontent.com/muhammederdem/credit-card-form/master/src/assets/images/${getCardType}.png`}
                    alt={getCardType}
                    className="card-item__typeImg"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="card-form__inner">
          <div className="card-input">
            <label htmlFor="cardNumber" className="card-input__label">
              Card Number
            </label>
            <input
              type="text"
              id="cardNumber"
              ref={cardNumberInputRef}
              className="card-input__input"
              value={cardNumber}
              onChange={handleCardNumberChange}
              onFocus={focusInput}
              onBlur={blurInput}
              data-ref="cardNumber"
              autoComplete="off"
              placeholder="1234 5678 9012 3456"
            />
          </div>

          <div className="card-input">
            <label htmlFor="cardName" className="card-input__label">
              Card Holder
            </label>
            <input
              type="text"
              id="cardName"
              className="card-input__input"
              value={cardName}
              onChange={handleCardNameChange}
              onFocus={focusInput}
              onBlur={blurInput}
              data-ref="cardName"
              autoComplete="off"
              placeholder="JOHN DOE"
            />
          </div>

          <div className="card-form__row">
            <div className="card-form__col">
              <div className="card-form__group custom-select-row">
                <CustomSelect
                  label="Expiration Date"
                  value={cardMonth}
                  options={monthOptions}
                  placeholder="Month"
                  onChange={setCardMonth}
                  onFocusCard={focusInput}
                  onBlurCard={blurInput}
                  dataRef="cardDate"
                />

                <CustomSelect
                  label="&nbsp;"
                  value={cardYear}
                  options={yearOptions}
                  placeholder="Year"
                  onChange={setCardYear}
                  onFocusCard={focusInput}
                  onBlurCard={blurInput}
                  dataRef="cardDate"
                />
              </div>
            </div>

            <div className="card-form__col -cvv">
              <div className="card-input">
                <label htmlFor="cardCvv" className="card-input__label">
                  CVV
                </label>
                <input
                  type="text"
                  className="card-input__input"
                  id="cardCvv"
                  maxLength="4"
                  value={cardCvv}
                  onChange={handleCardCvvChange}
                  onFocus={() => setIsCardFlipped(true)}
                  onBlur={() => setIsCardFlipped(false)}
                  autoComplete="off"
                  placeholder="123"
                />
              </div>
            </div>
          </div>

          <button className="card-form__button">Pay Now</button>
        </div>
      </div>
    </div>
  );
};

export default CreditCardForm;