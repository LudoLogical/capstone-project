"use client";

import {
  REPOSITORY_FILES,
  REPOSITORY_LINKS,
  REPOSITORY_CONVERSATIONS,
} from "@/data/seed";
import BackButton from "@/components/primitives/BackButton";
import { useOrgName } from "@/store/derived";
import { Paperclip, Plus } from "lucide-react";
import ProfileDetailsSection from "@/app/account/ProfileDetailsSection";
import RepositorySection from "@/app/account/RepositorySection";
import { InitiativeSourceKind } from "@/types/data";

/**
 * The Profile screen is a data repository: three collections the app pulls from
 * when filling in applications and reports. Each section paginates its rows and
 * lets you remove an item. State is local - this is prototype content, not a
 * persisted store.
 */
export default function AccountProfilePage() {
  const orgName = useOrgName();

  return (
    <div className="animate-nc-rise mx-auto w-full max-w-3xl px-8 pt-7 pb-28">
      <BackButton fallback="/" />
      <h1 className="mb-2.5 font-serif text-3xl leading-tight font-bold">
        {orgName}
      </h1>
      <p className="mb-6 max-w-2xl text-sm leading-relaxed text-ink-muted">
        Here, you&apos;ll find all of the information that we have collected
        about your organization. We use it to determine which grants are the
        most relevant to you, as well as to help you gather data for your grant
        applications and reports. You can add to, edit, or delete any of this
        information at any time.
      </p>

      <ProfileDetailsSection />

      <RepositorySection
        title="Files"
        kind={InitiativeSourceKind.Document}
        description="These are the documents you've uploaded while gathering data for grant applications and reports. We save them so that we can pull from them automatically whenever you gather data in the future."
        addLabel="Upload new file"
        addIcon={Paperclip}
        fileUpload
        verb="Uploaded"
        sources={REPOSITORY_FILES}
        underlineLabel
      />

      <RepositorySection
        title="Webpages"
        kind={InitiativeSourceKind.Webpage}
        description="These are the links you've saved while gathering data for grant applications and reports. We save them so that we can pull from them automatially whenever you gather data in the future."
        addLabel="Add new website link"
        addIcon={Plus}
        addPlaceholder="https://example.org"
        verb="Uploaded"
        sources={REPOSITORY_LINKS}
        underlineLabel
      />

      <RepositorySection
        title="From Your Conversations"
        kind={InitiativeSourceKind.Chat}
        description="These are some of the things you've mentioned while gathering data for grant reports in conversation with AI. We save your messages when the AI thinks you've shared something new so that we can pull from them automatically whenever you gather data in the future."
        verb="Logged"
        sources={REPOSITORY_CONVERSATIONS}
        help={
          <>
            Because these data points are captured from conversations, we store
            and process them differently than simple statements of fact. If you
            just want to share a new piece of information about your
            organization, try uploading a simple text file or a PDF instead.
          </>
        }
      />
    </div>
  );
}
