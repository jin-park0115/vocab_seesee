import WidgetKit
import SwiftUI

// Update to match the App Group id used in the app and widget targets.
private let appGroupId = "group.com.yourcompany.vocab"
private let snapshotFileName = "widget_word.json"

struct WidgetWordSnapshot: Codable {
  let id: String
  let lang: String
  let word: String
  let meaning_ko: String
}

struct WordEntry: TimelineEntry {
  let date: Date
  let word: WidgetWordSnapshot?
}

struct WordProvider: TimelineProvider {
  func placeholder(in context: Context) -> WordEntry {
    WordEntry(date: Date(), word: nil)
  }

  func getSnapshot(in context: Context, completion: @escaping (WordEntry) -> Void) {
    completion(loadEntry())
  }

  func getTimeline(in context: Context, completion: @escaping (Timeline<WordEntry>) -> Void) {
    let entry = loadEntry()
    let timeline = Timeline(entries: [entry], policy: .never)
    completion(timeline)
  }

  private func loadEntry() -> WordEntry {
    guard let data = loadSnapshotData() else {
      return WordEntry(date: Date(), word: nil)
    }

    let decoder = JSONDecoder()
    guard let word = try? decoder.decode(WidgetWordSnapshot.self, from: data) else {
      return WordEntry(date: Date(), word: nil)
    }

    return WordEntry(date: Date(), word: word)
  }

  private func loadSnapshotData() -> Data? {
    guard let containerURL = FileManager.default.containerURL(
      forSecurityApplicationGroupIdentifier: appGroupId
    ) else {
      return nil
    }
    let fileURL = containerURL.appendingPathComponent(snapshotFileName)
    return try? Data(contentsOf: fileURL)
  }
}

struct VocabWidgetEntryView: View {
  @Environment(\.widgetFamily) private var family
  let entry: WordProvider.Entry

  var body: some View {
    if let word = entry.word {
      contentView(word: word)
        .widgetURL(URL(string: "vocab:///word/\(word.id)"))
    } else {
      VStack(alignment: .leading, spacing: 4) {
        Text("Tap to open")
          .font(.headline)
        Text("Open Vocab to refresh")
          .font(.caption)
          .foregroundColor(.secondary)
      }
      .widgetURL(URL(string: "vocab://"))
    }
  }

  @ViewBuilder
  private func contentView(word: WidgetWordSnapshot) -> some View {
    switch family {
    case .accessoryInline:
      Text("\(word.word) · \(word.meaning_ko)")
    default:
      VStack(alignment: .leading, spacing: 4) {
        Text(word.word)
          .font(.headline)
        Text(word.meaning_ko)
          .font(.caption)
          .foregroundColor(.secondary)
      }
    }
  }
}

@main
struct VocabWidget: Widget {
  let kind = "VocabWidget"

  var body: some WidgetConfiguration {
    StaticConfiguration(kind: kind, provider: WordProvider()) { entry in
      VocabWidgetEntryView(entry: entry)
    }
    .configurationDisplayName("Vocab Word")
    .description("Shows a word from Vocab.")
    .supportedFamilies([.accessoryRectangular, .accessoryInline])
  }
}
