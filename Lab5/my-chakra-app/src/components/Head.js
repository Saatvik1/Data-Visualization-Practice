import React from 'react';
import { Anchor } from 'antd';

const App = () => (
  <>
    <div
      style={{
        padding: '20px',
      }}
    >
      <Anchor
        direction="horizontal"
        items={[
          {
            key: 'part-1',
            href: '#part-1',
            title: 'Part 1',
          },
          {
            key: 'part-2',
            href: '#part-2',
            title: 'Part 2',
          },
          {
            key: 'part-3',
            href: '#part-3',
            title: 'Part 3',
          },
          {
            key: 'part-4',
            href: '#part-4',
            title: 'Part 4',
          },
          {
            key: 'part-5',
            href: '#part-5',
            title: 'Part 5',
          },
          {
            key: 'part-6',
            href: '#part-6',
            title: 'Part 6',
          },
          {
            key: 'part-7',
            href: '#part-7',
            title: 'Part 7',
          },
        ]}
      />
    </div>
    <div>
      <div
        id="part-1"
        style={{
          width: '100vw',
          height: '100vh',
          textAlign: 'center',
          background: 'rgba(0,255,0,0.02)',
        }}
      >
        Part 1 Content
      </div>
      <div
        id="part-2"
        style={{
          width: '100vw',
          height: '100vh',
          textAlign: 'center',
          background: 'rgba(0,0,255,0.02)',
        }}
      >
        Part 2 Content
      </div>
      <div
        id="part-3"
        style={{
          width: '100vw',
          height: '100vh',
          textAlign: 'center',
          background: '#FFFBE9',
        }}
      >
        Part 3 Content
      </div>
      <div
        id="part-4"
        style={{
          width: '100vw',
          height: '100vh',
          textAlign: 'center',
          background: 'rgba(255,0,0,0.02)',
        }}
      >
        Part 4 Content
      </div>
      <div
        id="part-5"
        style={{
          width: '100vw',
          height: '100vh',
          textAlign: 'center',
          background: 'rgba(255,255,0,0.02)',
        }}
      >
        Part 5 Content
      </div>
      <div
        id="part-6"
        style={{
          width: '100vw',
          height: '100vh',
          textAlign: 'center',
          background: 'rgba(0,255,255,0.02)',
        }}
      >
        Part 6 Content
      </div>
      <div
        id="part-7"
        style={{
          width: '100vw',
          height: '100vh',
          textAlign: 'center',
          background: 'rgba(255,0,255,0.02)',
        }}
      >
        Part 7 Content
      </div>
    </div>
  </>
);

export default App;
