import { motion } from 'motion/react';
import { BookOpen } from 'lucide-react';

export default function Splash({ onFinish }: { onFinish: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: 0 }}
      transition={{ delay: 3.5, duration: 0.5 }}
      onAnimationComplete={onFinish}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0B1120] text-[#D4AF37]"
    >
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="mb-8 flex flex-col items-center"
      >
        {/* Placeholder for Logo - Replace with your image if needed */}
        <div className="w-40 h-40 rounded-full border-4 border-[#D4AF37] flex items-center justify-center mb-4 bg-[#0B1120] shadow-[0_0_30px_rgba(212,175,55,0.2)]">
            <BookOpen size={80} strokeWidth={1.5} />
        </div>
        <div className="text-6xl font-serif font-bold tracking-tighter">MBB</div>
      </motion.div>
      
      <motion.h1
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="text-3xl font-bold mb-2 text-center tracking-wide"
      >
        Missão Batista Betel
      </motion.h1>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="absolute bottom-10 text-[#D4AF37]/60 text-sm font-medium tracking-widest uppercase"
      >
        Developed by Abdiel
      </motion.p>
    </motion.div>
  );
}
