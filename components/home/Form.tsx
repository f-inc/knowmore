import LoadingDots from '../ui/LoadingDots';
import { getFeedback } from './analyze';
import { useState } from 'react';

const Form = () => {
  const [tweet, setTweet] = useState<string>('');
  const [handle, setHandle] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<string>();

  const analyze = () => {
    (async () => {
      setLoading(true);

      try {
        let feedback = await getFeedback(
          tweet,
          handle === '' ? undefined : handle
        );

        setResult(feedback);
        setLoading(false);
      } catch {
        console.error('Error getting feedback');
        setLoading(false);
      }
    })();
  };

  console.log(result);

  return (
    <>
      <div className="flex flex-col items-center justify-center mt-10 lg:mt-20 gap-y-5">
        <textarea
          className="w-full overflow-hidden lg:w-1/2 text-white outline-none bg-[#00000026] rounded-2xl p-5 border border-solid border-[#FFFFFF1F] placeholder-white placeholder-opacity-25 h-40 resize-none"
          placeholder="Start typing or paste your tweet.*"
          value={tweet}
          onChange={(e) => setTweet(e.target.value)}
        />
        <input
          type="text"
          className="w-full lg:w-1/2 text-white outline-none bg-[#00000026] rounded-xl px-5 border border-solid border-[#FFFFFF1F] border-opacity-25 placeholder-white placeholder-opacity-25 h-12"
          placeholder="twitter @ (for accurate feedback, optional)"
          value={handle}
          onChange={(e) => setHandle(e.target.value)}
        />
        <button
          className="text-[#8D5BDF] bg-[#5A25B080] rounded-xl font-medium text-base px-6 h-12 w-full lg:w-1/2 disabled:cursor-not-allowed flex items-center justify-center"
          disabled={tweet === '' || loading}
          onClick={analyze}
        >
          {/* We need your Twitter @ to give you accurate feedback, based on
              your past tweets. */}
          {loading ? <LoadingDots /> : ' Analyze'}
        </button>
      </div>

      <div className="mt-10 lg:mt-16 font-medium text-base tracking-wide">
        {result && (
          <div>
            <div className="text-white text-xl font-medium flex justify-center">
              {' '}
              Output:
            </div>
            <br />
            <br />
            {/* line break when theres a new line*/}
            {result.split('\n').map((i, key) => {
              return (
                <div key={key}>
                  {i}
                  <br />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
};

export default Form;
