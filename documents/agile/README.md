# Agile DFlow Integration - Project Rules & Guidelines

## Quick Reference

### 📋 Core Agile Rules

1. **Sprint Duration**: 2 weeks
2. **Sprint Ceremonies**: Planning → Daily Check-ins → Review → Retrospective
3. **Velocity Target**: 20-25 story points per sprint
4. **Story Point Scale**: Fibonacci (1, 2, 3, 5, 8, 13, 21)
5. **Definition of Done**: Code + Tests + Format + Build + Documentation

### 🎯 Sprint Workflow

```
Week 1: Sprint Planning (Day 1) → Daily execution → Mid-sprint review (Day 5)
Week 2: Continue execution → Sprint Review → Retrospective → Next Planning
```

### 📊 Story/Task Tracking Rules

#### Story Status Flow

```
Draft → Ready → In Progress → Review → Testing → Done
```

#### Priority Levels

- **High**: Sprint commitment, blocks other work
- **Medium**: Important but can be delayed
- **Low**: Nice to have, fill extra capacity

#### Story Point Reference

- **1 point**: Config change, small UI tweak (≤1 day)
- **2 points**: Basic API call, simple component (1-2 days)
- **3 points**: New endpoint with logic (2-3 days)
- **5 points**: Complex integration with error handling (3-5 days)
- **8 points**: Full feature frontend + backend + tests (5-8 days)
- **13+ points**: Break down into smaller stories

### ✅ Definition of Ready (Before Sprint)

- [ ] User story format complete
- [ ] Acceptance criteria clear and testable
- [ ] Technical approach documented
- [ ] Dependencies identified and resolved
- [ ] Story points estimated
- [ ] DFlow API endpoints identified (if applicable)

### ✅ Definition of Done (Before Story Complete)

- [ ] All acceptance criteria met
- [ ] Code follows project standards
- [ ] Unit/integration tests passing
- [ ] Code formatted: `pnpm format`
- [ ] Build successful: `pnpm build`
- [ ] Documentation updated
- [ ] No console errors/warnings
- [ ] DFlow API integration tested (if applicable)

## 📁 Document Structure

```
documents/agile/
├── development-plan.md          # Overall agile strategy
├── dflow-integration-architecture.md  # Technical design
├── templates/
│   ├── sprint-planning.md       # Sprint planning template
│   ├── user-story.md           # User story template
│   └── sprint-retrospective.md # Retro template
├── backlog/
│   └── product-backlog.md      # All user stories and epics
└── sprints/
    ├── sprint-1-plan.md        # Current sprint plan
    ├── sprint-2-plan.md        # Future sprints...
    └── sprint-reports/         # Completed sprint summaries
```

## 🚀 Sprint Process

### 1. Sprint Planning (4 hours)

1. **Review sprint goal** (30 min)
2. **Select stories from backlog** (90 min)
3. **Break down tasks and estimate hours** (60 min)
4. **Confirm sprint commitment** (30 min)
5. **Update sprint plan document** (30 min)

### 2. Daily Planning (15 min)

- What did I accomplish yesterday?
- What will I work on today?
- Any blockers or risks?
- Update story status in tracking

### 3. Sprint Review (2 hours)

- Demo completed functionality
- Review sprint metrics (velocity, completion)
- Update product backlog based on learnings
- Prepare for retrospective

### 4. Sprint Retrospective (1.5 hours)

- What went well? What didn't?
- Lessons learned (technical & process)
- Action items for next sprint
- Update team processes if needed

## 📈 Progress Tracking

### Sprint Metrics to Track

- **Velocity**: Story points completed per sprint
- **Burndown**: Daily progress toward sprint goal
- **Completion Rate**: % of committed stories completed
- **Quality**: Bugs found post-completion

### DFlow Integration Specific Metrics

- **API Success Rate**: % successful DFlow API calls
- **Integration Test Coverage**: % of DFlow features tested
- **Performance**: API response times, caching effectiveness

### Story Status Updates

Update story status immediately when:

- Starting work on a story → "In Progress"
- Code complete, ready for review → "Review"
- Review complete, ready for testing → "Testing"
- All acceptance criteria met → "Done"

## 🔄 Backlog Management

### Epic Planning

1. **Epic Definition**: Large feature spanning multiple sprints
2. **Story Breakdown**: Epics divided into 2-8 point stories
3. **Priority Ordering**: High-value, high-risk stories first
4. **Dependency Management**: Identify cross-story dependencies

### Backlog Refinement

**Weekly**: Review and refine upcoming sprint stories

- Add acceptance criteria
- Break down large stories
- Estimate story points
- Update priorities based on learnings

### Story Writing Guidelines

```
As a [user type]
I want [functionality]
So that [business value]

Acceptance Criteria:
Given [context]
When [action]
Then [expected outcome]
```

## ⚠️ Risk Management

### Common DFlow Integration Risks

1. **API Changes**: Monitor DFlow updates, use version pinning
2. **Rate Limiting**: Implement caching, respectful API usage
3. **Network Issues**: Retry logic, offline fallbacks
4. **Data Inconsistency**: Robust sync mechanisms
5. **Learning Curve**: Allocate research time, create spikes

### Risk Mitigation Process

1. **Identify**: Document risks in sprint planning
2. **Assess**: Rate probability and impact
3. **Mitigate**: Define specific mitigation strategies
4. **Monitor**: Track risk status throughout sprint
5. **Respond**: Adjust plans when risks materialize

## 📋 Quality Gates

### Code Quality

- All code must pass `pnpm format`
- All code must pass `pnpm build`
- No high-severity linting errors
- Test coverage minimum 80% for new code

### DFlow Integration Quality

- All DFlow API calls must handle errors gracefully
- Response data must be validated with TypeScript
- Integration tests must cover happy path and error cases
- Performance impact must be measured and acceptable

### Review Process

1. **Self Review**: Check against Definition of Done
2. **Code Review**: Technical correctness and standards
3. **Testing**: Manual validation of acceptance criteria
4. **Documentation**: Ensure updates are complete

## 🎯 Success Criteria

### Sprint Success

- Sprint goal achieved
- 80%+ of committed story points completed
- No critical bugs introduced
- All DFlow integrations working as designed
- Team velocity maintained or improved

### Overall Project Success

- Full DFlow integration functional
- User can discover, trade, and settle real markets
- Performance meets acceptable standards
- Code quality and testing standards maintained
- Documentation complete and up-to-date

---

## Quick Start Checklist

Ready to begin agile DFlow integration? Verify:

- [ ] All agile documents created and reviewed
- [ ] Sprint 1 plan finalized and ready to execute
- [ ] Development environment configured
- [ ] DFlow API access confirmed
- [ ] Team understands agile process and rules
- [ ] Tracking system ready (GitHub issues, etc.)

**🚀 Ready to start Sprint 1!**

---

**Created**: [Date]  
**Updated**: [Date]  
**Next Review**: Sprint 1 Planning session
