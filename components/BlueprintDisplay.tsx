import React, { useRef, useState, useMemo } from 'react';
import type { Blueprint, CoreService, TechStackItem, MonetizationModel, ArchitecturalComponent, RoadmapPhase, Competitor, TeamRole, ComparisonData } from '../types';
import { getTechnologyComparison } from '../services/geminiService';
import { TargetIcon } from './icons/TargetIcon';
import { CodeIcon } from './icons/CodeIcon';
import { DollarSignIcon } from './icons/DollarSignIcon';
import { ArchitectureIcon } from './icons/ArchitectureIcon';
import { RoadmapIcon } from './icons/RoadmapIcon';
import { PaletteIcon } from './icons/PaletteIcon';
import { ChevronRightIcon } from './icons/ChevronRightIcon';
import { DownloadIcon } from './icons/DownloadIcon';
import { Loader } from './Loader';
import { ShieldCheckIcon } from './icons/ShieldCheckIcon';
import { UsersIcon } from './icons/UsersIcon';
import { ChevronDownIcon } from './icons/ChevronDownIcon';
import { ClipboardListIcon } from './icons/ClipboardListIcon';
import { XIcon } from './icons/XIcon';
import { FocusIcon } from './icons/FocusIcon';
import { KpiIcon } from './icons/KpiIcon';
import { MilestoneIcon } from './icons/MilestoneIcon';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';


interface BlueprintDisplayProps {
  blueprint: Blueprint;
  logoUrl: string | null;
  isLogoLoading: boolean;
}

interface SectionProps {
    title: string;
    icon: React.ReactNode;
    children: React.ReactNode;
    index: number;
    isCollapsed: boolean;
    onToggle: () => void;
}

const fuzzySearch = (query: string, text: string): number => {
    const q = query.toLowerCase();
    const t = text.toLowerCase();
    if (q === t) return Infinity; // Exact match is always best
    if (t.startsWith(q)) return t.length - q.length + 100; // Prefix matches are great

    let score = 0;
    let lastMatchIndex = -1;
    for (let i = 0; i < q.length; i++) {
        const char = q[i];
        const index = t.indexOf(char, lastMatchIndex + 1);
        if (index === -1) {
            return 0; // Character not found, no match
        }
        // Score based on how close the characters are
        score += 10 - (index - lastMatchIndex - 1);
        lastMatchIndex = index;
    }
    return score;
};

const Section: React.FC<SectionProps> = ({ title, icon, children, index, isCollapsed, onToggle }) => (
    <div 
        className="bg-white dark:bg-slate-900 rounded-2xl mb-8 border border-slate-200 dark:border-slate-800 shadow-lg dark:shadow-indigo-950/10 animate-fade-in-up transition-colors duration-300"
        style={{ animationDelay: `${index * 100}ms`, opacity: 0 }}
    >
        <button
            onClick={onToggle}
            className="w-full flex items-center justify-between p-6 text-left"
            aria-expanded={!isCollapsed}
            aria-controls={`section-content-${index}`}
        >
            <div className="flex items-center">
                <div className="p-2 bg-indigo-500/10 dark:bg-indigo-500/20 rounded-full mr-4">{icon}</div>
                <h2 className="text-2xl font-bold text-indigo-600 dark:text-indigo-300">{title}</h2>
            </div>
            <ChevronDownIcon className={`w-6 h-6 text-slate-500 dark:text-slate-400 transform transition-transform duration-300 ${isCollapsed ? '' : 'rotate-180'}`} />
        </button>
        <div
            id={`section-content-${index}`}
            className={`grid transition-[grid-template-rows] duration-500 ease-in-out ${isCollapsed ? 'grid-rows-[0fr]' : 'grid-rows-[1fr]'}`}
        >
            <div className="overflow-hidden">
                <div className={`px-6 pb-6 transition-all duration-300 ease-in-out ${isCollapsed ? 'opacity-0 -translate-y-2' : 'opacity-100 translate-y-0 delay-150'}`}>
                    {children}
                </div>
            </div>
        </div>
    </div>
);

const RoadmapPhaseItem: React.FC<{ phase: RoadmapPhase, isExpanded: boolean, onToggle: () => void }> = ({ phase, isExpanded, onToggle }) => (
    <li className="relative pl-8">
        <div className="absolute left-[3px] top-2 w-2 h-2 rounded-full bg-slate-400 dark:bg-slate-600 ring-4 ring-slate-100 dark:ring-slate-950"></div>
        <div className="bg-slate-50 dark:bg-slate-800/70 rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden transition-all duration-300">
            <button onClick={onToggle} className="w-full p-4 text-left flex justify-between items-center">
                <div>
                    <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">{phase.phase}</p>
                    <h3 className="font-bold text-lg text-purple-600 dark:text-purple-300">{phase.title}</h3>
                </div>
                <ChevronDownIcon className={`w-5 h-5 text-slate-500 dark:text-slate-400 transform transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
            </button>
            <div className={`grid transition-[grid-template-rows] duration-500 ease-in-out ${isExpanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
                <div className="overflow-hidden">
                    <div className="p-4 border-t border-slate-200 dark:border-slate-700/50">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <h4 className="flex items-center gap-2 text-md font-semibold text-slate-700 dark:text-slate-300 mb-2"><FocusIcon className="w-5 h-5"/>Focus Areas:</h4>
                                <ul className="space-y-1.5">
                                    {phase.focus.map((item, fIndex) => (
                                        <li key={fIndex} className="flex items-start text-sm text-slate-600 dark:text-slate-400">
                                            <ChevronRightIcon className="w-4 h-4 mr-2 mt-0.5 text-indigo-500 dark:text-indigo-400 flex-shrink-0" />
                                            <span>{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div>
                                <h4 className="flex items-center gap-2 text-md font-semibold text-slate-700 dark:text-slate-300 mb-2"><KpiIcon className="w-5 h-5"/>KPIs:</h4>
                                <ul className="space-y-1.5">
                                    {phase.kpis.map((kpi, kIndex) => (
                                        <li key={kIndex} className="flex items-start text-sm text-slate-600 dark:text-slate-400">
                                            <ChevronRightIcon className="w-4 h-4 mr-2 mt-0.5 text-indigo-500 dark:text-indigo-400 flex-shrink-0" />
                                            <span>{kpi}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div>
                                <h4 className="flex items-center gap-2 text-md font-semibold text-slate-700 dark:text-slate-300 mb-2"><MilestoneIcon className="w-5 h-5"/>Milestones:</h4>
                                <ul className="space-y-1.5">
                                    {phase.milestones.map((milestone, mIndex) => (
                                        <li key={mIndex} className="flex items-start text-sm text-slate-600 dark:text-slate-400">
                                            <ChevronRightIcon className="w-4 h-4 mr-2 mt-0.5 text-indigo-500 dark:text-indigo-400 flex-shrink-0" />
                                            <span>{milestone}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </li>
);


export const BlueprintDisplay: React.FC<BlueprintDisplayProps> = ({ blueprint, logoUrl, isLogoLoading }) => {
    const blueprintRef = useRef<HTMLDivElement>(null);
    const [isExportingJson, setIsExportingJson] = useState(false);
    const [isExportingPdf, setIsExportingPdf] = useState(false);
    const [jsonExportError, setJsonExportError] = useState<string | null>(null);
    const [pdfExportError, setPdfExportError] = useState<string | null>(null);
    const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({ "Model & Technology Comparator": true });
    const [expandedPhase, setExpandedPhase] = useState<number | null>(0); 

    const [searchQuery, setSearchQuery] = useState('');
    const [comparisonItems, setComparisonItems] = useState<string[]>([]);
    const [comparisonData, setComparisonData] = useState<ComparisonData | null>(null);
    const [isComparing, setIsComparing] = useState(false);
    const [comparisonError, setComparisonError] = useState<string | null>(null);

    const allTechnologies = useMemo(() => {
        if (!blueprint) return [];
        const techSet = new Set<string>();
        blueprint.techStack.forEach(stack => stack.technologies.forEach(tech => techSet.add(tech)));
        blueprint.architecturalBlueprint.forEach(comp => comp.technologies.forEach(tech => techSet.add(tech)));
        return Array.from(techSet).sort();
    }, [blueprint]);

    const filteredTechnologies = useMemo(() => {
        if (!searchQuery) return [];
        return allTechnologies
            .map(tech => ({
                tech,
                score: fuzzySearch(searchQuery, tech)
            }))
            .filter(item => item.score > 0 && !comparisonItems.includes(item.tech))
            .sort((a, b) => b.score - a.score)
            .map(item => item.tech)
            .slice(0, 10);
    }, [searchQuery, allTechnologies, comparisonItems]);

    const handleAddToComparison = (tech: string) => {
        if (!comparisonItems.includes(tech)) {
            setComparisonItems([...comparisonItems, tech]);
            setSearchQuery('');
        }
    };

    const handleRemoveFromComparison = (tech: string) => {
        setComparisonItems(comparisonItems.filter(item => item !== tech));
    };

    const handleCompare = async () => {
        if (comparisonItems.length < 2) return;
        setIsComparing(true);
        setComparisonError(null);
        setComparisonData(null);
        try {
            const data = await getTechnologyComparison(comparisonItems);
            setComparisonData(data);
        } catch (error: any) {
            setComparisonError(error.message || 'An unknown error occurred during comparison.');
        } finally {
            setIsComparing(false);
        }
    };

    const handleToggleSection = (title: string) => {
        setCollapsedSections(prev => ({
            ...prev,
            [title]: !prev[title]
        }));
    };
    
    const handleTogglePhase = (index: number) => {
        setExpandedPhase(expandedPhase === index ? null : index);
    };

    const getVersionedFilename = (timestamp: string, extension: 'json' | 'pdf') => {
        const companyName = blueprint.companyName.toLowerCase().replace(/\s/g, '-');
        return `${companyName}-blueprint-${timestamp}.${extension}`;
    };

    const handleExportJson = () => {
        setIsExportingJson(true);
        setJsonExportError(null);
        setPdfExportError(null);
        try {
            const timestamp = new Date().toISOString();
            const dataToExport = {
                ...blueprint,
                generatedAt: timestamp,
                schemaVersion: '1.1.0'
            };
            const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
                JSON.stringify(dataToExport, null, 2)
            )}`;
            const link = document.createElement("a");
            link.href = jsonString;
            const filenameTimestamp = timestamp.replace(/[:.]/g, '-');
            link.download = getVersionedFilename(filenameTimestamp, 'json');
            link.click();
        } catch (error) {
            console.error("Failed to export JSON", error);
            setJsonExportError("Could not save the JSON file. This may be due to browser security settings blocking downloads. Please check your browser's site permissions and try again.");
        } finally {
            setIsExportingJson(false);
        }
    };

    const handleExportPdf = async () => {
        const content = blueprintRef.current;
        if (!content) return;

        setIsExportingPdf(true);
        setPdfExportError(null);
        setJsonExportError(null);

        const originalCollapsedState = { ...collapsedSections };
        setCollapsedSections({});
        
        await new Promise(resolve => setTimeout(resolve, 500));

        try {
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const margin = 15;
            const usableWidth = pdfWidth - margin * 2;
            const pdfHeight = pdf.internal.pageSize.getHeight();
            let y = margin;
            
            const sections = Array.from(content.children).filter(el => el.tagName.toLowerCase() !== 'header') as HTMLElement[];

            for (const section of sections) {
                 const canvas = await html2canvas(section, {
                    scale: 2,
                    backgroundColor: '#020617', 
                    useCORS: true,
                    windowWidth: section.scrollWidth,
                    windowHeight: section.scrollHeight
                });
                
                const imgData = canvas.toDataURL('image/png');
                const imgProps = pdf.getImageProperties(imgData);
                const imgHeight = (imgProps.height * usableWidth) / imgProps.width;

                if (y > margin && y + imgHeight > pdfHeight - margin) {
                    pdf.addPage();
                    y = margin;
                }

                pdf.addImage(imgData, 'PNG', margin, y, usableWidth, imgHeight);
                y += imgHeight + 10;
            }
            
            const timestamp = new Date().toISOString();
            const pageCount = pdf.getNumberOfPages();
            for (let i = 1; i <= pageCount; i++) {
                pdf.setPage(i);
                
                pdf.setFont('helvetica', 'bold');
                pdf.setFontSize(14);
                pdf.setTextColor('#A5B4FC'); 
                pdf.text(blueprint.companyName + " - Blueprint", margin, margin - 5);
                pdf.setDrawColor('#334155'); 
                pdf.line(margin, margin - 2, pdfWidth - margin, margin - 2);

                pdf.setFont('helvetica', 'normal');
                pdf.setFontSize(8);
                pdf.setTextColor('#94A3B8'); 
                const footerY = pdfHeight - margin + 8;
                pdf.text(`Page ${i} of ${pageCount}`, pdfWidth / 2, footerY, { align: 'center' });
                pdf.text(`Generated: ${new Date(timestamp).toLocaleString()}`, margin, footerY);
            }
            
            const filenameTimestamp = timestamp.replace(/[:.]/g, '-');
            pdf.save(getVersionedFilename(filenameTimestamp, 'pdf'));

        } catch (error) {
            console.error("Failed to export PDF", error);
            setPdfExportError("Failed to generate PDF. This can occur with complex blueprints or specific browser settings. If this issue persists, please try exporting as JSON instead.");
        } finally {
            setIsExportingPdf(false);
            setCollapsedSections(originalCollapsedState);
        }
    };

    const sections = [
        { title: "Core Services", icon: <TargetIcon className="w-6 h-6 text-indigo-500 dark:text-indigo-400"/>, content: (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {blueprint.coreServices.map((service: CoreService, index: number) => (
                    <div key={index} className="bg-slate-50 dark:bg-slate-800/70 p-4 rounded-lg border border-slate-200 dark:border-slate-800">
                    <h3 className="font-semibold text-lg text-purple-600 dark:text-purple-300">{service.name}</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 mb-3">{service.description}</p>
                    <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Key Features:</h4>
                    <ul className="space-y-2">
                        {service.features.map((feature, fIndex) => (
                        <li key={fIndex} className="flex items-start text-sm">
                            <ChevronRightIcon className="w-4 h-4 mr-2 mt-0.5 text-indigo-500 dark:text-indigo-400 flex-shrink-0" />
                            <span className="text-slate-700 dark:text-slate-300">{feature}</span>
                        </li>
                        ))}
                    </ul>
                    </div>
                ))}
            </div>
        )},
        { title: "Target Audience & UI/UX", icon: <PaletteIcon className="w-6 h-6 text-indigo-500 dark:text-indigo-400"/>, content: (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                    <h3 className="font-semibold text-lg text-purple-600 dark:text-purple-300 mb-3">Target Audience</h3>
                    <ul className="space-y-2">
                        {blueprint.targetAudience.map((audience, index) => (
                            <li key={index} className="flex items-start text-slate-700 dark:text-slate-300">
                                <ChevronRightIcon className="w-5 h-5 mr-2 mt-0.5 text-indigo-500 dark:text-indigo-400 flex-shrink-0" />
                                <span>{audience}</span>
                            </li>
                        ))}
                    </ul>
                </div>
                <div>
                    <h3 className="font-semibold text-lg text-purple-600 dark:text-purple-300 mb-3">UI/UX Principles</h3>
                    <ul className="space-y-2">
                        {blueprint.uiUxPrinciples.map((principle, index) => (
                            <li key={index} className="flex items-start text-slate-700 dark:text-slate-300">
                                <ChevronRightIcon className="w-5 h-5 mr-2 mt-0.5 text-indigo-500 dark:text-indigo-400 flex-shrink-0" />
                                <span>{principle}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        )},
        { title: "Technology Stack", icon: <CodeIcon className="w-6 h-6 text-indigo-500 dark:text-indigo-400"/>, content: (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {blueprint.techStack.map((stack: TechStackItem, index: number) => (
                    <div key={index} className="bg-slate-50 dark:bg-slate-800/70 p-4 rounded-lg border border-slate-200 dark:border-slate-800">
                    <h4 className="font-bold text-purple-600 dark:text-purple-300 border-b border-slate-200 dark:border-slate-700 pb-2 mb-2">{stack.category}</h4>
                    <ul className="space-y-1">
                        {stack.technologies.map((tech, tIndex) => <li key={tIndex} className="text-sm text-slate-600 dark:text-slate-400">{tech}</li>)}
                    </ul>
                    </div>
                ))}
            </div>
        )},
        { title: "Model & Technology Comparator", icon: <ClipboardListIcon className="w-6 h-6 text-indigo-500 dark:text-indigo-400"/>, content: (
            <div>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Search for technologies mentioned in the blueprint to generate a side-by-side comparison. Requires a Google GenAI API key configured in the app environment.</p>
                <div className="relative mb-4">
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search for a technology to compare..."
                        className="w-full p-3 bg-slate-50 dark:bg-slate-800/70 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                    />
                    {filteredTechnologies.length > 0 && (
                        <ul className="absolute z-10 w-full mt-1 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                            {filteredTechnologies.map(tech => (
                                <li
                                    key={tech}
                                    onClick={() => handleAddToComparison(tech)}
                                    className="px-4 py-2 cursor-pointer hover:bg-indigo-50 dark:hover:bg-indigo-900/50"
                                >
                                    {tech}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
                {comparisonItems.length > 0 && (
                    <div className="mb-4">
                        <h4 className="text-sm font-semibold mb-2">Selected for Comparison:</h4>
                        <div className="flex flex-wrap gap-2">
                            {comparisonItems.map(item => (
                                <div key={item} className="flex items-center gap-2 px-3 py-1 bg-indigo-100 dark:bg-indigo-900/50 rounded-full text-sm font-medium text-indigo-800 dark:text-indigo-200">
                                    <span>{item}</span>
                                    <button onClick={() => handleRemoveFromComparison(item)} className="text-indigo-500 hover:text-indigo-700 dark:text-indigo-300 dark:hover:text-indigo-100">
                                        <XIcon className="w-4 h-4"/>
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                <button
                    onClick={handleCompare}
                    disabled={isComparing || comparisonItems.length < 2}
                    className="flex items-center justify-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-75 transition-all duration-300 disabled:bg-indigo-400 disabled:cursor-not-allowed"
                >
                    {isComparing ? <><Loader /> Comparing...</> : 'Compare Selected'}
                </button>
                <div className="mt-6">
                    {comparisonError && <p className="text-red-500 dark:text-red-400 text-sm text-center p-4 bg-red-100 dark:bg-red-900/30 rounded-lg">{comparisonError}</p>}
                    {comparisonData && (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr>
                                        {comparisonData.map(item => (
                                            <th key={item.technologyName} className="p-4 border-b-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/70 font-semibold text-purple-600 dark:text-purple-300">{item.technologyName}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="align-top">
                                        <td colSpan={comparisonData.length} className="pt-4 pb-2 px-2 font-bold text-slate-700 dark:text-slate-300">Pros</td>
                                    </tr>
                                    <tr className="align-top">
                                        {comparisonData.map(item => (
                                            <td key={item.technologyName} className="p-4 border-b border-slate-200 dark:border-slate-700"><ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">{item.pros.map((pro, i) => <li key={i}>{pro}</li>)}</ul></td>
                                        ))}
                                    </tr>
                                     <tr className="align-top">
                                        <td colSpan={comparisonData.length} className="pt-4 pb-2 px-2 font-bold text-slate-700 dark:text-slate-300">Cons</td>
                                    </tr>
                                    <tr className="align-top">
                                        {comparisonData.map(item => (
                                            <td key={item.technologyName} className="p-4 border-b border-slate-200 dark:border-slate-700"><ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">{item.cons.map((con, i) => <li key={i}>{con}</li>)}</ul></td>
                                        ))}
                                    </tr>
                                     <tr className="align-top">
                                        <td colSpan={comparisonData.length} className="pt-4 pb-2 px-2 font-bold text-slate-700 dark:text-slate-300">Best Use Cases</td>
                                    </tr>
                                    <tr className="align-top">
                                        {comparisonData.map(item => (
                                            <td key={item.technologyName} className="p-4"><ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">{item.bestUseCases.map((useCase, i) => <li key={i}>{useCase}</li>)}</ul></td>
                                        ))}
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        ) },
        { title: "Team Structure and Roles", icon: <UsersIcon className="w-6 h-6 text-indigo-500 dark:text-indigo-400"/>, content: (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {blueprint.teamStructure.map((role: TeamRole, index: number) => (
                    <div key={index} className="bg-slate-50 dark:bg-slate-800/70 p-4 rounded-lg border border-slate-200 dark:border-slate-800">
                        <h3 className="font-semibold text-lg text-purple-600 dark:text-purple-300">{role.title}</h3>
                        <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mt-3 mb-2">Key Responsibilities:</p>
                        <ul className="space-y-2">
                            {role.responsibilities.map((responsibility, rIndex) => (
                                <li key={rIndex} className="flex items-start text-sm text-slate-600 dark:text-slate-400">
                                    <ChevronRightIcon className="w-4 h-4 mr-2 mt-0.5 text-indigo-500 dark:text-indigo-400 flex-shrink-0" />
                                    <span>{responsibility}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
        )},
        { title: "Monetization Strategy", icon: <DollarSignIcon className="w-6 h-6 text-indigo-500 dark:text-indigo-400"/>, content: (
            <div className="space-y-6">
                {blueprint.monetization.map((model: MonetizationModel, index: number) => (
                    <div key={index} className="bg-slate-50 dark:bg-slate-800/70 p-4 rounded-lg border border-slate-200 dark:border-slate-800">
                        <h3 className="font-semibold text-lg text-purple-600 dark:text-purple-300">{model.strategy}</h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 mb-4">{model.description}</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Pricing Details:</h4>
                                <ul className="space-y-1 text-sm text-slate-600 dark:text-slate-400">
                                    {model.pricingDetails.map((detail, dIndex) => (
                                        <li key={dIndex} className="flex items-start">
                                            <ChevronRightIcon className="w-4 h-4 mr-2 mt-0.5 text-indigo-500 dark:text-indigo-400 flex-shrink-0" />
                                            <span>{detail}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div>
                                <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Key Metrics to Track:</h4>
                                 <ul className="space-y-1 text-sm text-slate-600 dark:text-slate-400">
                                    {model.keyMetrics.map((metric, mIndex) => (
                                        <li key={mIndex} className="flex items-start">
                                             <ChevronRightIcon className="w-4 h-4 mr-2 mt-0.5 text-indigo-500 dark:text-indigo-400 flex-shrink-0" />
                                            <span>{metric}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        )},
        { title: "Competitive Analysis", icon: <ShieldCheckIcon className="w-6 h-6 text-indigo-500 dark:text-indigo-400"/>, content: (
            <>
                <h3 className="text-xl font-semibold text-purple-600 dark:text-purple-300 mb-3">Potential Competitors</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                    {blueprint.competitiveAnalysis.competitors.map((competitor: Competitor, index: number) => (
                        <div key={index} className="bg-slate-50 dark:bg-slate-800/70 p-4 rounded-lg border border-slate-200 dark:border-slate-800">
                            <h4 className="font-bold text-lg text-slate-800 dark:text-slate-200">{competitor.name}</h4>
                            <div className="mt-2">
                                <p className="text-sm font-semibold text-green-600 dark:text-green-400">Strengths:</p>
                                <ul className="list-disc list-inside text-sm text-slate-600 dark:text-slate-400 space-y-1 mt-1">
                                    {competitor.strengths.map((strength, sIndex) => <li key={sIndex}>{strength}</li>)}
                                </ul>
                            </div>
                            <div className="mt-3">
                                <p className="text-sm font-semibold text-red-600 dark:text-red-400">Weaknesses:</p>
                                 <ul className="list-disc list-inside text-sm text-slate-600 dark:text-slate-400 space-y-1 mt-1">
                                    {competitor.weaknesses.map((weakness, wIndex) => <li key={wIndex}>{weakness}</li>)}
                                </ul>
                            </div>
                        </div>
                    ))}
                </div>
                <h3 className="text-xl font-semibold text-purple-600 dark:text-purple-300 mb-3">Key Differentiators</h3>
                <ul className="space-y-2">
                    {blueprint.competitiveAnalysis.keyDifferentiators.map((differentiator, index) => (
                        <li key={index} className="flex items-start text-slate-700 dark:text-slate-300">
                            <ChevronRightIcon className="w-5 h-5 mr-2 mt-0.5 text-indigo-500 dark:text-indigo-400 flex-shrink-0" />
                            <span>{differentiator}</span>
                        </li>
                    ))}
                </ul>
            </>
        )},
        { title: "Architectural Blueprint", icon: <ArchitectureIcon className="w-6 h-6 text-indigo-500 dark:text-indigo-400"/>, content: (
             <div className="space-y-4">
                {blueprint.architecturalBlueprint.map((comp: ArchitecturalComponent, index: number) => (
                    <div key={index} className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-800">
                    <h4 className="font-semibold text-lg text-purple-600 dark:text-purple-300">{comp.component}</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 mb-2">{comp.description}</p>
                    <div className="flex flex-wrap gap-2">
                        {comp.technologies.map((tech, tIndex) => (
                        <span key={tIndex} className="px-2 py-1 text-xs bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-300 rounded-full">{tech}</span>
                        ))}
                    </div>
                    </div>
                ))}
            </div>
        )},
        { title: "Product Roadmap", icon: <RoadmapIcon className="w-6 h-6 text-indigo-500 dark:text-indigo-400"/>, content: (
             <div className="relative">
                <div className="absolute left-4 top-0 h-full w-0.5 bg-slate-200 dark:bg-slate-700"></div>
                <ul className="space-y-8">
                    {blueprint.roadmap.map((phase: RoadmapPhase, index: number) => (
                        <RoadmapPhaseItem
                            key={index}
                            phase={phase}
                            isExpanded={expandedPhase === index}
                            onToggle={() => handleTogglePhase(index)}
                        />
                    ))}
                </ul>
            </div>
        )},
    ]

  return (
    <div className="max-w-5xl mx-auto">
        <div className="mb-8 p-4 bg-slate-100 dark:bg-slate-900 rounded-lg flex flex-col print:hidden border border-slate-200 dark:border-slate-800">
            <div className="w-full flex items-center justify-end gap-4">
                <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mr-auto">Export Blueprint</h3>
                <button
                    onClick={handleExportJson}
                    disabled={isExportingJson || isExportingPdf}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-75 transition-all duration-300 disabled:bg-slate-300 dark:disabled:bg-slate-700 disabled:cursor-not-allowed"
                >
                    {isExportingJson ? <><Loader /> Exporting...</> : <><DownloadIcon className="w-5 h-5" /> JSON</>}
                </button>
                <button
                    onClick={handleExportPdf}
                    disabled={isExportingPdf || isExportingJson}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-75 transition-all duration-300 disabled:bg-slate-300 dark:disabled:bg-slate-700 disabled:cursor-not-allowed"
                >
                    {isExportingPdf ? <><Loader /> Exporting...</> : <><DownloadIcon className="w-5 h-5" /> PDF</>}
                </button>
            </div>

            {(jsonExportError || pdfExportError) && (
                    <div className="w-full mt-4 p-3 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700/50 text-red-700 dark:text-red-300 rounded-lg text-sm text-center">
                    {jsonExportError || pdfExportError}
                </div>
            )}
        </div>
      <div ref={blueprintRef}>
        <header className="text-center mb-12 animate-fade-in-up flex flex-col items-center gap-6">
            {isLogoLoading && (
                <div className="w-24 h-24 rounded-full bg-slate-200 dark:bg-slate-800 p-2 shadow-lg flex items-center justify-center">
                    <Loader />
                </div>
            )}
            {!isLogoLoading && logoUrl && (
                <img 
                    src={logoUrl} 
                    alt={`${blueprint.companyName} Logo`} 
                    className="w-24 h-24 rounded-full bg-slate-200 dark:bg-slate-800 p-2 shadow-lg animate-scale-in"
                />
            )}
            <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400">{blueprint.companyName}</h1>
            <p className="mt-2 text-xl text-slate-500 dark:text-slate-400 italic">"{blueprint.missionStatement}"</p>
            <p className="mt-1 text-md text-slate-600 dark:text-slate-500"><strong>Vision:</strong> {blueprint.visionStatement}</p>
        </header>

        {sections.map((sec, index) => (
            <Section 
                key={sec.title} 
                title={sec.title} 
                icon={sec.icon} 
                index={index}
                isCollapsed={!!collapsedSections[sec.title]}
                onToggle={() => handleToggleSection(sec.title)}
            >
                {sec.content}
            </Section>
        ))}

      </div>
    </div>
  );
};