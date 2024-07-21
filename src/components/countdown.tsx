import ReactCountdown, { CountdownRendererFn } from "react-countdown";

const Completionist = () => <span>You are good to go!</span>;

type CountdownProps = {};

const Countdown = ({}: CountdownProps) => {
  const renderer: CountdownRendererFn = ({
    props,
    total,
    formatted,
    completed,
  }) => {
    const { days, hours, minutes, seconds } = formatted;

    const text = `${days}d ${hours}h ${minutes}m ${seconds}s`;

    if (completed) {
      // Render a completed state
      return <Completionist />;
    } else {
      // Render a countdown
      return (
        <span className="text-6xl italic font-black tracking-tighter">
          {text}
        </span>
      );
    }
  };

  return <ReactCountdown date={Date.now() + 10000} renderer={renderer} />;
};

export { Countdown };
