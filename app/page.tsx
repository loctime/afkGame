import dynamic from 'next/dynamic';

const AFKRPGGame = dynamic(
  () => import('../components/AFKRPGGame'),
  { ssr: false }
);

export default function Home() {
  return <AFKRPGGame />;
}
