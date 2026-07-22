"use client";

import BackButton from "@/components/primitives/BackButton";
import { useOrgName } from "@/store/derived";
import { useAppStore } from "@/store/useAppStore";
import { Paperclip, Plus } from "lucide-react";
import ProfileDetailsSection from "@/app/account/ProfileDetailsSection";
import RepositorySection from "@/app/account/RepositorySection";
import { InitiativeSourceKind } from "@/types/data";

/**
 * The Profile screen is a data repository: three collections the app pulls from
 * when filling in applications and reports. Each section paginates its rows and
 * lets you remove an item.
 *
 * The rows come from the store rather than straight from the seed, because a
 * file or link the user adds while gathering data for a grant has to appear
 * here too - and because a source removed here has to disappear from the flows
 * that cite it.
 */
export default function AccountProfilePage() {
  const orgName = useOrgName();
  // The single repository every screen writes to, so a file or link added while
  // gathering data for a grant is listed here as well.
  const repository = useAppStore((s) => s.repository);
  const addRepositoryDocuments = useAppStore((s) => s.addRepositoryDocuments);
  const addRepositoryWebpage = useAppStore((s) => s.addRepositoryWebpage);
  const removeRepositorySource = useAppStore((s) => s.removeRepositorySource);

  const ofKind = (kind: InitiativeSourceKind) =>
    repository.filter((s) => s.kind === kind);

  return (
    <div className="animate-nc-rise mx-auto w-full max-w-3xl px-8 pt-7 pb-16">
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
        addLabel="Upload new file(s)"
        addIcon={Paperclip}
        fileUpload
        verb="Uploaded"
        sources={ofKind(InitiativeSourceKind.Document)}
        onAddDocuments={addRepositoryDocuments}
        onRemove={removeRepositorySource}
        underlineLabel
      />

      <RepositorySection
        title="Webpages"
        kind={InitiativeSourceKind.Webpage}
        description="These are the links you've saved while gathering data for grant applications and reports. We save them so that we can pull from them automatially whenever you gather data in the future."
        addLabel="Add new webpage"
        addIcon={Plus}
        addPlaceholder="https://example.org"
        verb="Uploaded"
        sources={ofKind(InitiativeSourceKind.Webpage)}
        onAddWebpage={addRepositoryWebpage}
        onRemove={removeRepositorySource}
        underlineLabel
      />

      <RepositorySection
        title="From Your Conversations"
        kind={InitiativeSourceKind.Chat}
        description="These are some of the things you've mentioned while gathering data for grant reports in conversation with AI. We save your messages when the AI thinks you've shared something new so that we can pull from them automatically whenever you gather data in the future."
        verb="Logged"
        sources={ofKind(InitiativeSourceKind.Chat)}
        onRemove={removeRepositorySource}
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
