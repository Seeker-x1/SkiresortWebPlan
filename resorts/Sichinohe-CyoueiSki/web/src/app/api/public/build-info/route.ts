import { NextResponse } from "next/server";

/** 本番デプロイ版の確認用（Git SHA / レール UI 世代） */
export async function GET() {
  return NextResponse.json(
    {
      commit: process.env.VERCEL_GIT_COMMIT_SHA ?? "local",
      ref: process.env.VERCEL_GIT_COMMIT_REF ?? "local",
      deploymentId: process.env.VERCEL_DEPLOYMENT_ID ?? null,
      railUi: "split-rail-right-trail-default",
      statusSource: "git-deployed-json-first",
    },
    {
      headers: { "Cache-Control": "no-store" },
    },
  );
}
