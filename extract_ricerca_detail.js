const fs = require('fs');
const path = require('path');

const appPath = path.join(__dirname, 'frontend/src/App.jsx');
const appCode = fs.readFileSync(appPath, 'utf8');

// Find the start and end of the block
const startMarker = '{selectedRicercaId && ricercaDetail && (';
const startIdx = appCode.indexOf(startMarker);

let endIdx = -1;
let depth = 0;
for (let i = startIdx + startMarker.length - 1; i < appCode.length; i++) {
  if (appCode[i] === '(') depth++;
  else if (appCode[i] === ')') depth--;
  if (depth === 0) {
    endIdx = i;
    break;
  }
}

if (startIdx === -1 || endIdx === -1) {
  console.log('Block not found');
  process.exit(1);
}

const block = appCode.slice(startIdx + startMarker.length, endIdx);

// Extract the JSX content (which is wrapped in a div)
const jsxContent = block.trim();

// Now, we need to create RicercaDetail.jsx
// We will pass all necessary props. Let's just destructure them from props.
const allProps = [
  'ricercaDetail', 'setRicercaDetail', 'timeline', 'setTimeline', 'activeTab', 'setActiveTab',
  'showNewCandidatoPipelineModal', 'setShowNewCandidatoPipelineModal', 'isNewCandidate', 'setIsNewCandidate',
  'candidati', 'clienti', 'operatori', 'commerciali', 'API_BASE', 'showStatus',
  'handleOpenValutazione', 'renderCandidateStars', 'getAffinedCandidati', 'handleLinkCandidatoToRicerca',
  'handleInsertCandidate', 'handleFeedbackPositivo', 'handleFeedbackNegativo', 'handleRemoveFromPipeline',
  'handleUnlinkCandidate', 'handleToggleInviatoStatus', 'handleEditCandidato', 'handleSaveAnnuncio',
  'handleUpdatePipelineStatus', 'handleScheduleInterview', 'handleDeleteInterview', 'handleEditInterviewDetails',
  'handleSaveResearchNote', 'handleStartTrial', 'handleToggleStar', 'handleApprovalAction',
  'setSelectedRicercaId', 'setSelectedSubjectLog', 'showNewInterviewFormModal', 'setShowNewInterviewFormModal',
  'showNewTrialFormModal', 'setShowNewTrialFormModal', 'showNewAssunzioneModal', 'setShowNewAssunzioneModal',
  'showAdStatusModal', 'setShowAdStatusModal', 'handleUpdateAdStatus', 'newAdStatus', 'setNewAdStatus',
  'adStatusMotivation', 'setAdStatusMotivation', 'adTimeline', 'fetchAdTimeline', 'setSelectedPipeCand',
  'selectedPipeCand', 'selectedInterviewForManagement', 'setSelectedInterviewForManagement', 'showInterviewStatusModal',
  'setShowInterviewStatusModal', 'selectedTrialForManagement', 'setSelectedTrialForManagement', 'showTrialStatusModal',
  'setShowTrialStatusModal', 'pendingHiringCandidate', 'setPendingHiringCandidate', 'handlePrintSingleInterviewReport',
  'handlePrintSingleTrialReport'
];

// Many props, so we'll just pass them all or let the component accept `props` and destructure.
const propsString = allProps.join(',\n  ');

const componentCode = `import React from 'react';
import { API_BASE, getCapFromAddress, estimateDistanceByCap, renderCandidateStars } from '../utils';
import { useToast } from '../contexts/ToastContext';
import { useGlobalState } from '../contexts/GlobalStateContext';

export default function RicercaDetail({
  ${propsString}
}) {
  return (
    ${jsxContent}
  );
}
`;

fs.writeFileSync(path.join(__dirname, 'frontend/src/pages/RicercaDetail.jsx'), componentCode);

// Replace the block in App.jsx with `<RicercaDetail {...props} />`
const newAppCode = appCode.slice(0, startIdx) + 
  `{selectedRicercaId && ricercaDetail && (
            <RicercaDetail 
              ricercaDetail={ricercaDetail} setRicercaDetail={setRicercaDetail} timeline={timeline} setTimeline={setTimeline} activeTab={activeTab} setActiveTab={setActiveTab}
              showNewCandidatoPipelineModal={showNewCandidatoPipelineModal} setShowNewCandidatoPipelineModal={setShowNewCandidatoPipelineModal} isNewCandidate={isNewCandidate} setIsNewCandidate={setIsNewCandidate}
              candidati={candidati} clienti={clienti} operatori={operatori} commerciali={commerciali} API_BASE={API_BASE} showStatus={showStatus}
              handleOpenValutazione={handleOpenValutazione} renderCandidateStars={renderCandidateStars} getAffinedCandidati={getAffinedCandidati} handleLinkCandidatoToRicerca={handleLinkCandidatoToRicerca}
              handleInsertCandidate={handleInsertCandidate} handleFeedbackPositivo={handleFeedbackPositivo} handleFeedbackNegativo={handleFeedbackNegativo} handleRemoveFromPipeline={handleRemoveFromPipeline}
              handleUnlinkCandidate={handleUnlinkCandidate} handleToggleInviatoStatus={handleToggleInviatoStatus} handleEditCandidato={handleEditCandidato} handleSaveAnnuncio={handleSaveAnnuncio}
              handleUpdatePipelineStatus={handleUpdatePipelineStatus} handleScheduleInterview={handleScheduleInterview} handleDeleteInterview={handleDeleteInterview} handleEditInterviewDetails={handleEditInterviewDetails}
              handleSaveResearchNote={handleSaveResearchNote} handleStartTrial={handleStartTrial} handleToggleStar={handleToggleStar} handleApprovalAction={handleApprovalAction}
              setSelectedRicercaId={setSelectedRicercaId} setSelectedSubjectLog={setSelectedSubjectLog} showNewInterviewFormModal={showNewInterviewFormModal} setShowNewInterviewFormModal={setShowNewInterviewFormModal}
              showNewTrialFormModal={showNewTrialFormModal} setShowNewTrialFormModal={setShowNewTrialFormModal} showNewAssunzioneModal={showNewAssunzioneModal} setShowNewAssunzioneModal={setShowNewAssunzioneModal}
              showAdStatusModal={showAdStatusModal} setShowAdStatusModal={setShowAdStatusModal} handleUpdateAdStatus={handleUpdateAdStatus} newAdStatus={newAdStatus} setNewAdStatus={setNewAdStatus}
              adStatusMotivation={adStatusMotivation} setAdStatusMotivation={setAdStatusMotivation} adTimeline={adTimeline} fetchAdTimeline={fetchAdTimeline} setSelectedPipeCand={setSelectedPipeCand}
              selectedPipeCand={selectedPipeCand} selectedInterviewForManagement={selectedInterviewForManagement} setSelectedInterviewForManagement={setSelectedInterviewForManagement} showInterviewStatusModal={showInterviewStatusModal}
              setShowInterviewStatusModal={setShowInterviewStatusModal} selectedTrialForManagement={selectedTrialForManagement} setSelectedTrialForManagement={setSelectedTrialForManagement} showTrialStatusModal={showTrialStatusModal}
              setShowTrialStatusModal={setShowTrialStatusModal} pendingHiringCandidate={pendingHiringCandidate} setPendingHiringCandidate={setPendingHiringCandidate} handlePrintSingleInterviewReport={handlePrintSingleInterviewReport}
              handlePrintSingleTrialReport={handlePrintSingleTrialReport}
            />
          )}` + appCode.slice(endIdx + 1);

// Inject import
const importStatement = "import RicercaDetail from './pages/RicercaDetail';\n";
const appCodeWithImport = newAppCode.replace("import Clienti from './pages/Clienti';", "import Clienti from './pages/Clienti';\n" + importStatement);

fs.writeFileSync(appPath, appCodeWithImport);

console.log('Extraction complete');
