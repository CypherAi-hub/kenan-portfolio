"use client";
import { motion } from "motion/react";

const code = `import boto3

s3 = boto3.client("s3")
rek = boto3.client("rekognition")

def label(bucket: str, key: str):
    res = rek.detect_labels(
        Image={"S3Object": {"Bucket": bucket, "Name": key}},
        MaxLabels=10, MinConfidence=80,
    )
    return [{"name": l["Name"], "conf": l["Confidence"]}
            for l in res["Labels"]]

if __name__ == "__main__":
    print(label("kl-images", "lab/sample.jpg"))`;

export default function AWSVisual() {
  return (
    <motion.pre
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="bg-bg text-fg-secondary absolute inset-0 m-0 overflow-auto p-5 font-mono text-[11px] leading-[1.55]"
    >
      {code.split("\n").map((line, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 + i * 0.04 }}
        >
          <span className="tabular text-fg-dimmed mr-4 select-none">
            {String(i + 1).padStart(2, "0")}
          </span>
          <span
            dangerouslySetInnerHTML={{
              __html: line
                .replace(
                  /(import|def|return|if|__name__)/g,
                  '<span style="color:#7CFFB2">$1</span>',
                )
                .replace(/("[^"]*")/g, '<span style="color:#FFD66B">$1</span>')
                .replace(/(\b\d+\b)/g, '<span style="color:#5EEAD4">$1</span>'),
            }}
          />
        </motion.div>
      ))}
    </motion.pre>
  );
}
